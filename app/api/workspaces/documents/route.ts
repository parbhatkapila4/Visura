import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  shareDocumentWithWorkspace,
  getSharedDocuments,
} from "@/lib/workspaces";

// GET - Get shared documents in a workspace
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const documents = await getSharedDocuments(workspaceId);
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching shared documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared documents" },
      { status: 500 }
    );
  }
}

// POST - Share a document with a workspace
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pdfSummaryId, workspaceId, permission } = body;

    if (!pdfSummaryId || !workspaceId) {
      return NextResponse.json(
        { error: "pdfSummaryId and workspaceId are required" },
        { status: 400 }
      );
    }

    const share = await shareDocumentWithWorkspace({
      pdfSummaryId,
      workspaceId,
      sharedBy: userId,
      permission: permission || "view",
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error("Error sharing document:", error);
    return NextResponse.json(
      { error: "Failed to share document" },
      { status: 500 }
    );
  }
}









