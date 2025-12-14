import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revokeShareToken } from "@/lib/summaries";

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

    await revokeShareToken(summaryId, userId);

    return NextResponse.json({
      success: true,
      message: "Share link revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking share token:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to revoke share link";

    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
