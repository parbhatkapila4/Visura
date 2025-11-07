export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rzp } from "@/src/lib/razorpay";
import { currencyFromCountry } from "@/src/lib/currency";

const DECIMALS: Record<string, number> = {
  INR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  CAD: 2,
  AUD: 2,
  SGD: 2,
  JPY: 0,
};

export async function POST(req: Request) {
  const { amount, receiptId, notes } = await req.json();

  const country = headers().get("x-vercel-ip-country") || null;
  const currency = currencyFromCountry(country);
  const subunits = Math.round(Number(amount) * 10 ** (DECIMALS[currency] ?? 2));

  const order = await rzp.orders.create({
    amount: subunits,
    currency,
    receipt: receiptId,
    notes,
  });

  return NextResponse.json({
    orderId: order.id,
    key: process.env.RAZORPAY_KEY_ID,
    currency,
    country,
  });
}

