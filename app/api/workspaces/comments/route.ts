import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { addDocumentComment, getDocumentComments, getWorkspaceById } from "@/lib/workspaces";
async function canUseWorkspaceComments(
  pdfSummaryId: string,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  if (!(await getWorkspaceById(workspaceId, userId))) {
    return false;
  }
  const sql = await getDbConnection();
  const [share] = await sql`
    SELECT id FROM document_shares
    WHERE pdf_summary_id = ${pdfSummaryId} AND workspace_id = ${workspaceId}
  `;
  return !!share;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pdfSummaryId = searchParams.get("pdfSummaryId");
    const workspaceId = searchParams.get("workspaceId");

    if (!pdfSummaryId || !workspaceId) {
      return NextResponse.json(
        { error: "pdfSummaryId and workspaceId are required" },
        { status: 400 }
      );
    }

    if (!(await canUseWorkspaceComments(pdfSummaryId, workspaceId, userId))) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const comments = await getDocumentComments(pdfSummaryId, workspaceId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { pdfSummaryId, workspaceId, content, position, parentCommentId } = body;

    if (!pdfSummaryId || !workspaceId || !content) {
      return NextResponse.json(
        { error: "pdfSummaryId, workspaceId and content are required" },
        { status: 400 }
      );
    }

    if (!(await canUseWorkspaceComments(pdfSummaryId, workspaceId, userId))) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const comment = await addDocumentComment({
      pdfSummaryId,
      workspaceId,
      userId,
      userEmail: user.emailAddresses[0]?.emailAddress || "",
      userName: user.fullName || undefined,
      content: content.trim(),
      position,
      parentCommentId,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
