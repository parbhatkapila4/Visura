import { rzp } from "@/src/lib/razorpay";
import { grantPlan, isPaidPlan, paymentCoversPlan, type PaidPlanId } from "./billing";
interface PaymentEntity {
  order_id?: unknown;
  status?: unknown;
  amount?: unknown;
  currency?: unknown;
}

interface OrderEntity {
  notes?: unknown;
}

export type ApplyPaymentResult =
  | { kind: "applied"; plan: PaidPlanId; email: string; changed: boolean }
  | { kind: "pending"; paymentStatus: string }
  | { kind: "rejected"; reason: string };

export async function applyPayment({
  paymentId,
  orderId,
  payment,
  order,
}: {
  paymentId: string;
  orderId: string;
  payment?: PaymentEntity;
  order?: OrderEntity;
}): Promise<ApplyPaymentResult> {
  const pay: PaymentEntity = payment ?? (await rzp.payments.fetch(paymentId));
  if (pay.order_id !== orderId) {
    return { kind: "rejected", reason: "payment belongs to a different order" };
  }

  if (pay.status !== "captured") {
    const status = typeof pay.status === "string" ? pay.status : "unknown";
    return status === "created" || status === "authorized"
      ? { kind: "pending", paymentStatus: status }
      : { kind: "rejected", reason: `payment is ${status}` };
  }

  const ord: OrderEntity = order ?? (await rzp.orders.fetch(orderId));
  const notes =
    ord.notes && typeof ord.notes === "object" && !Array.isArray(ord.notes)
      ? (ord.notes as Record<string, unknown>)
      : {};
  const email = typeof notes.email === "string" && notes.email ? notes.email : null;
  const plan = notes.plan;
  if (!email || !isPaidPlan(plan)) {
    return { kind: "rejected", reason: "order names no account or plan" };
  }

  if (!paymentCoversPlan(plan, pay)) {
    return {
      kind: "rejected",
      reason: `captured ${String(pay.amount)} ${String(pay.currency)}, less than ${plan} costs`,
    };
  }

  const outcome = await grantPlan({ email, plan, orderId, paymentId });
  return {
    kind: "applied",
    plan: isPaidPlan(outcome.plan) ? outcome.plan : plan,
    email,
    changed: outcome.changed,
  };
}
