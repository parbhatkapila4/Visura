import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  sendWorkspaceChatMessage,
  getWorkspaceChatMessages,
  getWorkspaceChatMessagesSince,
} from "@/lib/workspaces";

// GET - Get chat messages for a workspace
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const since = searchParams.get("since");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the workspace
    const { getWorkspaceMembers } = await import("@/lib/workspaces");
    const members = await getWorkspaceMembers(workspaceId);
    const isMember = members.some((m) => m.user_id === userId && m.status === "active");

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    let messages;
    try {
      if (since) {
        const sinceDate = new Date(since);
        messages = await getWorkspaceChatMessagesSince(workspaceId, sinceDate);
      } else {
        messages = await getWorkspaceChatMessages(workspaceId, limit);
      }
      
      // Ensure messages is always an array
      if (!Array.isArray(messages)) {
        messages = [];
      }
    } catch (dbError: any) {
      // Check if it's a table doesn't exist error
      const errorMessage = dbError?.message || String(dbError);
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('workspace_chat_messages')) {
        console.error("Database table not found. Please run the migration:", errorMessage);
        return NextResponse.json(
          { 
            error: "Chat feature not initialized. Please run the database migration (workspace_chat_schema.sql) to enable chat functionality.",
            code: "TABLE_NOT_FOUND"
          },
          { status: 503 }
        );
      }
      throw dbError;
    }

    // Always return messages as an array, even if empty
    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error("Error fetching workspace chat messages:", error);
    const errorMessage = error?.message || "Failed to fetch chat messages";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Send a chat message to a workspace
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
    const { workspaceId, messageContent } = body;

    if (!workspaceId || !messageContent) {
      return NextResponse.json(
        { error: "workspaceId and messageContent are required" },
        { status: 400 }
      );
    }

    if (messageContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    try {
      const message = await sendWorkspaceChatMessage({
        workspaceId,
        userId,
        userEmail: user.emailAddresses[0]?.emailAddress || "",
        userName: user.fullName || undefined,
        messageContent: messageContent.trim(),
      });

      return NextResponse.json({ message }, { status: 201 });
    } catch (dbError: any) {
      // Check if it's a table doesn't exist error
      const errorMessage = dbError?.message || String(dbError);
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('workspace_chat_messages') || errorMessage.includes('Chat table not found')) {
        console.error("Database table not found. Please run the migration:", errorMessage);
        return NextResponse.json(
          { 
            error: "Chat feature not initialized. Please run the database migration (workspace_chat_schema.sql) to enable chat functionality.",
            code: "TABLE_NOT_FOUND"
          },
          { status: 503 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error sending workspace chat message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

