export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { rzp } from "@/src/lib/razorpay";

export async function POST(req: Request) {
  const { amountInUSD, receiptId, notes } = await req.json();
  const order = await rzp.orders.create({
    amount: Math.round(Number(amountInUSD) * 83 * 100),
    currency: "INR",
    receipt: receiptId,
    notes,
  });
  return NextResponse.json({
    orderId: order.id,
    key: process.env.RAZORPAY_KEY_ID,
  });
}

