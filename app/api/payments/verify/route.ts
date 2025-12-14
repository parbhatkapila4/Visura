export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { verifyCheckoutSignature } from "@/src/lib/razorpay";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const ok = verifyCheckoutSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!ok) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true });
}
