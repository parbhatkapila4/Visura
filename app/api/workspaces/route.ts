import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createWorkspace,
  getWorkspacesByUserId,
  getWorkspaceById,
} from "@/lib/workspaces";

// GET - List all workspaces for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("id");

    if (workspaceId) {
      // Get specific workspace
      const workspace = await getWorkspaceById(workspaceId, userId);
      if (!workspace) {
        return NextResponse.json(
          { error: "Workspace not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(workspace);
    }

    // Get all workspaces for user
    const workspaces = await getWorkspacesByUserId(userId);
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// POST - Create a new workspace
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
    const { name, description, plan } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const workspace = await createWorkspace({
      name: name.trim(),
      description: description?.trim(),
      ownerId: userId,
      ownerEmail: user.emailAddresses[0]?.emailAddress || "",
      ownerName: user.fullName || undefined,
      plan: plan || "free",
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

