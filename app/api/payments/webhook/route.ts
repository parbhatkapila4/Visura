export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { applyPayment } from "@/lib/apply-payment";
import { logger } from "@/lib/logger";
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("RAZORPAY_WEBHOOK_SECRET is not set; payments cannot be applied");
    return new NextResponse("Not configured", { status: 500 });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  if (!valid) return new NextResponse("Invalid signature", { status: 400 });

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      order?: { entity?: Record<string, unknown> };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Malformed body", { status: 400 });
  }
  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return NextResponse.json({ received: true, ignored: event.event ?? null });
  }

  const payment = event.payload?.payment?.entity ?? {};
  const paymentId = typeof payment.id === "string" ? payment.id : null;
  const orderId = typeof payment.order_id === "string" ? payment.order_id : null;

  if (!paymentId || !orderId) {
    logger.error("Captured payment has no order to attribute it to", undefined, {
      paymentId,
      orderId,
    });
    return NextResponse.json({ received: true, applied: false });
  }

  try {
    const result = await applyPayment({
      paymentId,
      orderId,
      payment,
      order: event.payload?.order?.entity,
    });

    if (result.kind === "applied") {
      return NextResponse.json({ received: true, applied: true, changed: result.changed });
    }

    logger.error("Captured payment was not applied", undefined, {
      paymentId,
      orderId,
      ...(result.kind === "rejected"
        ? { reason: result.reason }
        : { paymentStatus: result.paymentStatus }),
    });
    return NextResponse.json({ received: true, applied: false });
  } catch (error) {
    logger.error("Could not apply a captured payment; Razorpay will retry", error, {
      paymentId,
      orderId,
    });
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
