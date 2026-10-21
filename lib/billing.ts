import { getDbConnection } from "./db";
import { logger } from "./logger";

export type PlanId = "free" | "starter" | "pro";
export type PaidPlanId = Exclude<PlanId, "free">;

export interface Plan {
  id: Exclude<PlanId, "free">;
  label: string;
  documentLimit: number;
  amounts: Record<string, number>;
}
export const FREE_DOCUMENT_LIMIT = 5;

export const PLANS: Record<Exclude<PlanId, "free">, Plan> = {
  starter: {
    id: "starter",
    label: "Starter",
    documentLimit: 10,
    amounts: { INR: 880, USD: 10, EUR: 9 },
  },
  pro: {
    id: "pro",
    label: "Pro",
    documentLimit: 1000,
    amounts: { INR: 1770, USD: 20, EUR: 17 },
  },
};

export function isPaidPlan(value: unknown): value is Exclude<PlanId, "free"> {
  return value === "starter" || value === "pro";
}
export function amountFor(plan: Exclude<PlanId, "free">, currency: string): number | null {
  return PLANS[plan].amounts[currency] ?? null;
}

const CURRENCY_DECIMALS: Record<string, number> = {
  INR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  CAD: 2,
  AUD: 2,
  SGD: 2,
  JPY: 0,
};

export function subunitsFor(plan: PaidPlanId, currency: string): number | null {
  const amount = amountFor(plan, currency);
  if (amount === null) return null;
  return Math.round(amount * 10 ** (CURRENCY_DECIMALS[currency] ?? 2));
}

export function paymentCoversPlan(
  plan: PaidPlanId,
  paid: { amount?: unknown; currency?: unknown }
): boolean {
  if (typeof paid.currency !== "string") return false;
  const price = subunitsFor(plan, paid.currency);
  const amount = Number(paid.amount);
  return price !== null && Number.isFinite(amount) && amount >= price;
}
const PLAN_RANK: Record<PlanId, number> = { free: 0, starter: 1, pro: 2 };

export function isUpgrade(current: PlanId, target: PaidPlanId): boolean {
  return PLAN_RANK[target] > PLAN_RANK[current];
}

export function documentLimitFor(plan: string | null | undefined): number {
  return isPaidPlan(plan) ? PLANS[plan].documentLimit : FREE_DOCUMENT_LIMIT;
}

export type GrantOutcome = { changed: true; plan: PaidPlanId } | { changed: false; plan: PlanId };
export async function grantPlan({
  email,
  plan,
  orderId,
  paymentId,
}: {
  email: string;
  plan: PaidPlanId;
  orderId: string;
  paymentId: string;
}): Promise<GrantOutcome> {
  if (!email || !paymentId) {
    throw new Error("grantPlan needs an email and a payment id");
  }

  const sql = await getDbConnection();
  const rows = await sql`
    INSERT INTO users (
      email, full_name, status, plan, plan_granted_at, razorpay_order_id, razorpay_payment_id
    )
    VALUES (${email}, '', 'active', ${plan}, NOW(), ${orderId}, ${paymentId})
    ON CONFLICT (email) DO UPDATE
    SET plan = EXCLUDED.plan,
        status = 'active',
        plan_granted_at = EXCLUDED.plan_granted_at,
        razorpay_order_id = EXCLUDED.razorpay_order_id,
        razorpay_payment_id = EXCLUDED.razorpay_payment_id,
        updated_at = NOW()
    WHERE (CASE users.plan WHEN 'pro' THEN 2 WHEN 'starter' THEN 1 ELSE 0 END)
        < (CASE EXCLUDED.plan WHEN 'pro' THEN 2 WHEN 'starter' THEN 1 ELSE 0 END)
    RETURNING plan
  `;

  if (rows.length > 0) {
    logger.info("Plan granted", { email, plan, orderId, paymentId });
    return { changed: true, plan };
  }

  const [row] = await sql`SELECT plan, razorpay_payment_id FROM users WHERE email = ${email}`;
  const current: PlanId = isPaidPlan(row?.plan) ? row.plan : "free";

  if (row?.razorpay_payment_id === paymentId) {
    logger.info("Plan grant skipped; this payment was already applied", { email, paymentId });
  } else {
    logger.warn("Payment bought a plan the account already had; consider refunding it", {
      email,
      plan,
      currentPlan: current,
      orderId,
      paymentId,
    });
  }
  return { changed: false, plan: current };
}
export async function getPlanForEmail(email: string): Promise<PlanId> {
  if (!email) return "free";
  try {
    const sql = await getDbConnection();
    const rows = await sql`SELECT plan FROM users WHERE email = ${email} LIMIT 1`;
    const plan = rows?.[0]?.plan;
    return isPaidPlan(plan) ? plan : "free";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Could not read the plan; falling back to free for this render", error, {
      email,
      schemaMissing: /column .* does not exist/i.test(message),
    });
    return "free";
  }
}
