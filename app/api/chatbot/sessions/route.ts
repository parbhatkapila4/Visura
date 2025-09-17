import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  createQASession, 
  getQASessionsByPdfStore, 
  updateQASessionName, 
  deleteQASession 
} from "@/lib/chatbot";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pdfStoreId, sessionName } = await request.json();

    if (!pdfStoreId) {
      return NextResponse.json({ error: "PDF Store ID is required" }, { status: 400 });
    }

    const session = await createQASession({
      pdfStoreId,
      userId,
      sessionName: sessionName || "New Chat",
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Error creating QA session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pdfStoreId = searchParams.get("pdfStoreId");

    if (!pdfStoreId) {
      return NextResponse.json({ error: "PDF Store ID is required" }, { status: 400 });
    }

    const sessions = await getQASessionsByPdfStore(pdfStoreId, userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching QA sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, sessionName } = await request.json();

    if (!sessionId || !sessionName) {
      return NextResponse.json({ error: "Session ID and name are required" }, { status: 400 });
    }

    const result = await updateQASessionName(sessionId, userId, sessionName);
    
    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating QA session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    await deleteQASession(sessionId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting QA session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
