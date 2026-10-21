import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserDownloadCount,
  hasSummaryBeenDownloaded,
  recordSummaryDownload,
} from "@/lib/summaries";

const DOWNLOAD_LIMIT = 2;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const summaryId = searchParams.get("summaryId");

    const downloadCount = await getUserDownloadCount(userId);
    const hasDownloaded = summaryId ? await hasSummaryBeenDownloaded(userId, summaryId) : false;

    return NextResponse.json({
      downloadCount,
      downloadLimit: DOWNLOAD_LIMIT,
      canDownload: hasDownloaded || downloadCount < DOWNLOAD_LIMIT,
      hasDownloaded,
    });
  } catch (error) {
    console.error("Error checking download status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "Summary ID is required" }, { status: 400 });
    }

    const hasDownloaded = await hasSummaryBeenDownloaded(userId, summaryId);

    if (hasDownloaded) {
      return NextResponse.json({
        success: true,
        message: "Download allowed (re-download)",
        isRedownload: true,
      });
    }

    const downloadCount = await getUserDownloadCount(userId);
    if (downloadCount >= DOWNLOAD_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "Download limit reached",
          message: `You've used all ${DOWNLOAD_LIMIT} of your summary downloads. Summaries you've already downloaded can be downloaded again.`,
          downloadCount,
          downloadLimit: DOWNLOAD_LIMIT,
        },
        { status: 403 }
      );
    }

    await recordSummaryDownload(userId, summaryId);

    return NextResponse.json({
      success: true,
      message: "Download recorded successfully",
      downloadCount: await getUserDownloadCount(userId),
      downloadLimit: DOWNLOAD_LIMIT,
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to record download. Please try again.",
      },
      { status: 500 }
    );
  }
}
