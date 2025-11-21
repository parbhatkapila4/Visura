import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasActiveShareToken, getShareUrl } from "@/lib/summaries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const summaryId = resolvedParams.id;

    if (!summaryId) {
      return NextResponse.json(
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }

    const hasActiveShare = await hasActiveShareToken(summaryId);
    let shareUrl = null;

    if (hasActiveShare) {
      shareUrl = await getShareUrl(summaryId, userId);
    }

    return NextResponse.json({
      hasActiveShare,
      shareUrl,
    });
  } catch (error) {
    console.error("Error checking share status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to check share status",
      },
      { status: 500 }
    );
  }
}

