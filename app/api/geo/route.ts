export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { currencyFromCountry } from "@/src/lib/currency";

export async function GET() {
  const h = headers();
  const country = h.get("x-vercel-ip-country") || null;
  const currency = currencyFromCountry(country);
  return NextResponse.json({ country, currency });
}
