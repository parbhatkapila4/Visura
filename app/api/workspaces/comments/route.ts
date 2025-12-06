import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  addDocumentComment,
  getDocumentComments,
} from "@/lib/workspaces";

// GET - Get comments for a document
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pdfSummaryId = searchParams.get("pdfSummaryId");
    const workspaceId = searchParams.get("workspaceId");

    if (!pdfSummaryId) {
      return NextResponse.json(
        { error: "pdfSummaryId is required" },
        { status: 400 }
      );
    }

    const comments = await getDocumentComments(
      pdfSummaryId,
      workspaceId || undefined
    );
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Add a comment to a document
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
    const { pdfSummaryId, workspaceId, content, position, parentCommentId } =
      body;

    if (!pdfSummaryId || !content) {
      return NextResponse.json(
        { error: "pdfSummaryId and content are required" },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}




