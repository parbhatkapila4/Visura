import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { FREE_DOCUMENT_LIMIT, documentLimitFor, getPlanForEmail } from "@/lib/billing";
import { logger } from "@/lib/logger";
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({
        plan: "free",
        documentLimit: FREE_DOCUMENT_LIMIT,
        signedIn: false,
      });

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email)
      return NextResponse.json({
        plan: "free",
        documentLimit: FREE_DOCUMENT_LIMIT,
        signedIn: true,
      });

    const plan = await getPlanForEmail(email);
    return NextResponse.json({
      plan,
      documentLimit: documentLimitFor(plan),
      signedIn: true,
    });
  } catch (error) {
    logger.error("Could not resolve the caller's plan", error);
    return NextResponse.json({ error: "Could not read your plan." }, { status: 500 });
  }
}
