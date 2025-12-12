import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  shareDocumentWithWorkspace,
  getSharedDocuments,
} from "@/lib/workspaces";

// GET - Get shared documents in a workspace or check if a document is already shared
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const pdfSummaryId = searchParams.get("pdfSummaryId");

    // If checking for a specific document across all workspaces
    if (pdfSummaryId && workspaceId === "all") {
      const { getDbConnection } = await import("@/lib/db");
      const sql = await getDbConnection();
      
      const sharedDocs = await sql`
        SELECT workspace_id FROM document_shares
        WHERE pdf_summary_id = ${pdfSummaryId}
      `;
      
      return NextResponse.json(sharedDocs);
    }

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

    // Validate that the user owns the document
    const { getDbConnection } = await import("@/lib/db");
    const sql = await getDbConnection();
    const [summary] = await sql`
      SELECT user_id FROM pdf_summaries WHERE id = ${pdfSummaryId}
    `;

    if (!summary) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (summary.user_id !== userId) {
      return NextResponse.json(
        { error: "You can only share documents that you own" },
        { status: 403 }
      );
    }

    // Validate that the user is a member of the workspace
    const [workspaceMember] = await sql`
      SELECT * FROM workspace_members 
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId} AND status = 'active'
    `;

    if (!workspaceMember) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
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
    const errorMessage = error instanceof Error ? error.message : "Failed to share document";
    
    // Provide more specific error messages
    if (errorMessage.includes("does not exist") || errorMessage.includes("relation")) {
      return NextResponse.json(
        { error: "Database table not found. Please check your database schema." },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes("foreign key") || errorMessage.includes("constraint")) {
      return NextResponse.json(
        { error: "Invalid workspace or document reference." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}









