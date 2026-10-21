import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getWorkspaceById,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember,
} from "@/lib/workspaces";

const INVITABLE_ROLES = ["admin", "member", "viewer"] as const;
type InvitableRole = (typeof INVITABLE_ROLES)[number];
const GRANTABLE_ROLES: Record<string, readonly InvitableRole[]> = {
  owner: ["admin", "member", "viewer"],
  admin: ["member", "viewer"],
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    if (!(await getWorkspaceById(workspaceId, userId))) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const members = await getWorkspaceMembers(workspaceId);
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json({ error: "Failed to fetch workspace members" }, { status: 500 });
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
    const { workspaceId, userEmail, userName, role } = body;

    if (!workspaceId || !userEmail) {
      return NextResponse.json(
        { error: "workspaceId and userEmail are required" },
        { status: 400 }
      );
    }

    const requestedRole = role || "member";
    if (!INVITABLE_ROLES.includes(requestedRole)) {
      return NextResponse.json({ error: "role must be admin, member or viewer" }, { status: 400 });
    }

    const workspace = await getWorkspaceById(workspaceId, userId);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const grantable = GRANTABLE_ROLES[workspace.role] ?? [];
    if (!grantable.includes(requestedRole)) {
      return NextResponse.json(
        {
          error:
            grantable.length > 0
              ? "Only the workspace owner can invite admins"
              : "Only the workspace owner or an admin can invite members",
        },
        { status: 403 }
      );
    }

    const member = await inviteWorkspaceMember({
      workspaceId,
      userEmail: userEmail.trim().toLowerCase(),
      userName,
      role: requestedRole,
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
      return NextResponse.json({ error: "workspaceId and memberId are required" }, { status: 400 });
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
