import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  updateCollaborationSession,
  getActiveCollaborators,
  removeCollaborationSession,
} from "@/lib/workspaces";

// GET - Get active collaborators for a document
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pdfSummaryId = searchParams.get("pdfSummaryId");

    if (!pdfSummaryId) {
      return NextResponse.json(
        { error: "pdfSummaryId is required" },
        { status: 400 }
      );
    }

    const collaborators = await getActiveCollaborators(
      pdfSummaryId,
      userId
    );
    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// POST - Update collaboration session (cursor position, presence)
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
    const { pdfSummaryId, cursorPosition } = body;

    if (!pdfSummaryId) {
      return NextResponse.json(
        { error: "pdfSummaryId is required" },
        { status: 400 }
      );
    }

    const session = await updateCollaborationSession({
      pdfSummaryId,
      userId,
      userEmail: user.emailAddresses[0]?.emailAddress || "",
      userName: user.fullName || undefined,
      cursorPosition,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating collaboration session:", error);
    return NextResponse.json(
      { error: "Failed to update collaboration session" },
      { status: 500 }
    );
  }
}

// DELETE - Remove collaboration session (user left)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pdfSummaryId = searchParams.get("pdfSummaryId");

    if (!pdfSummaryId) {
      return NextResponse.json(
        { error: "pdfSummaryId is required" },
        { status: 400 }
      );
    }

    await removeCollaborationSession(pdfSummaryId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaboration session:", error);
    return NextResponse.json(
      { error: "Failed to remove collaboration session" },
      { status: 500 }
    );
  }
}










