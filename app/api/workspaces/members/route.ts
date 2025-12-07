import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember,
} from "@/lib/workspaces";

// GET - Get workspace members
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

    const members = await getWorkspaceMembers(workspaceId);
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace members" },
      { status: 500 }
    );
  }
}

// POST - Invite a member to workspace
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
    const { workspaceId, userEmail, userName, role } = body;

    if (!workspaceId || !userEmail) {
      return NextResponse.json(
        { error: "workspaceId and userEmail are required" },
        { status: 400 }
      );
    }

    const member = await inviteWorkspaceMember({
      workspaceId,
      userEmail: userEmail.trim().toLowerCase(),
      userName,
      role: role || "member",
      invitedBy: userId,
      invitedByName: user.fullName || undefined,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error("Error inviting workspace member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invite member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a member from workspace
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const memberId = searchParams.get("memberId");

    if (!workspaceId || !memberId) {
      return NextResponse.json(
        { error: "workspaceId and memberId are required" },
        { status: 400 }
      );
    }

    await removeWorkspaceMember({
      workspaceId,
      memberId,
      removedBy: userId,
      removedByName: user.fullName || undefined,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error removing workspace member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}


