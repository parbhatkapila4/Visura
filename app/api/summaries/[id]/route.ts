import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteSummary } from "@/lib/summaries";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }

    await deleteSummary(id, userId);

    return NextResponse.json(
      { message: "Summary deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete summary error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete summary";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
