import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateShareToken } from "@/lib/summaries";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const summaryId = resolvedParams.id;

    if (!summaryId) {
      return NextResponse.json({ error: "Summary ID is required" }, { status: 400 });
    }

    const shareToken = await generateShareToken(summaryId, userId);
    const shareUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    }/share/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareToken,
      shareUrl,
    });
  } catch (error) {
    console.error("Error generating share token:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate share link";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorDetails);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}
