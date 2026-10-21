export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { rzp } from "@/src/lib/razorpay";
import { currencyFromCountry } from "@/src/lib/currency";
import { PLANS, getPlanForEmail, isPaidPlan, isUpgrade, subunitsFor } from "@/lib/billing";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in before paying." }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "No email address on this account." }, { status: 400 });
  }

  let body: { plan?: unknown; receiptId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { plan, receiptId } = body;
  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const current = await getPlanForEmail(email);
  if (!isUpgrade(current, plan)) {
    const has = isPaidPlan(current) ? PLANS[current].label : current;
    return NextResponse.json(
      {
        error:
          current === plan
            ? `Your account already has ${has}, and it doesn't expire.`
            : `Your account already has ${has}, which keeps more documents than ${PLANS[plan].label}.`,
        plan: current,
      },
      { status: 409 }
    );
  }

  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || null;
  const currency = currencyFromCountry(country);

  const subunits = subunitsFor(plan, currency);
  if (subunits === null) {
    logger.warn("No price for plan in currency", { plan, currency, country });
    return NextResponse.json(
      { error: "This plan is not priced in your currency yet. Please get in touch." },
      { status: 400 }
    );
  }
  const amount = PLANS[plan].amounts[currency];

  const order = await rzp.orders.create({
    amount: subunits,
    currency,
    receipt: typeof receiptId === "string" ? receiptId.slice(0, 40) : `rcpt_${Date.now()}`,
    notes: { email, userId, plan },
  });

  return NextResponse.json({
    orderId: order.id,
    key: process.env.RAZORPAY_KEY_ID,
    currency,
    amount,
    plan,
    country,
  });
}
