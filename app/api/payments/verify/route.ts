export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { verifyCheckoutSignature } from "@/src/lib/razorpay";
import { applyPayment } from "@/lib/apply-payment";
import { logger } from "@/lib/logger";
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  let body: {
    razorpay_order_id?: unknown;
    razorpay_payment_id?: unknown;
    razorpay_signature?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ok = verifyCheckoutSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!ok) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const result = await applyPayment({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    if (result.kind === "pending") {
      return NextResponse.json({ ok: true, applied: false, pending: true });
    }

    if (result.kind === "rejected") {
      logger.error("Verified payment was not applied", undefined, {
        orderId: razorpay_order_id,
        reason: result.reason,
      });
      return NextResponse.json({ ok: true, applied: false });
    }

    const user = await currentUser();
    const sessionEmail = user?.emailAddresses?.[0]?.emailAddress ?? null;
    if (sessionEmail && sessionEmail !== result.email) {
      logger.warn("Verify called by a different account than the one that opened the order", {
        orderId: razorpay_order_id,
      });
    }

    return NextResponse.json({ ok: true, applied: true, plan: result.plan });
  } catch (error) {
    logger.error("Could not apply a verified payment; leaving it to the webhook", error, {
      orderId: razorpay_order_id,
    });
    return NextResponse.json({ ok: true, applied: false });
  }
}
