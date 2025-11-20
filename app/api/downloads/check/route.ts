import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDownloadCount, hasSummaryBeenDownloaded, recordSummaryDownload } from "@/lib/summaries";
import { getUserByEmail } from "@/lib/user";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const summaryId = searchParams.get("summaryId");

    // Get user plan
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const userData = await getUserByEmail(email);
    const userPlan = userData?.price_id ? "pro" : "basic";

    const downloadCount = await getUserDownloadCount(userId);
    const hasDownloaded = summaryId ? await hasSummaryBeenDownloaded(userId, summaryId) : false;

    // Basic users can download 2 summaries, pro users have unlimited
    const downloadLimit = userPlan === "pro" ? null : 2;
    const canDownload = userPlan === "pro" || downloadCount < downloadLimit || hasDownloaded;

    return NextResponse.json({
      downloadCount,
      downloadLimit,
      canDownload,
      hasDownloaded,
      userPlan,
    });
  } catch (error) {
    console.error("Error checking download status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { summaryId } = body;

    if (!summaryId) {
      return NextResponse.json(
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }

    // Record the download
    await recordSummaryDownload(userId, summaryId);

    return NextResponse.json({
      success: true,
      message: "Download recorded successfully",
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

