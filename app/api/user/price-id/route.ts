import { NextRequest, NextResponse } from "next/server";
import { getPriceIdForUser } from "@/lib/user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const priceId = await getPriceIdForUser(email);
    
    return NextResponse.json({ priceId });
  } catch (error) {
    console.error("Error fetching price ID:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
