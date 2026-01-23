import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { getTimelineForDocument } from "@/lib/document-change-events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = await getDbConnection();

    const [document] = await sql`
      SELECT * FROM documents WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const timeline = await getTimelineForDocument(id);

    return NextResponse.json({
      documentId: id,
      timeline: timeline.map((event) => ({
        fromVersion: event.from_version,
        toVersion: event.to_version,
        changeType: event.change_type,
        summary: event.summary,
        confidence: event.confidence,
        affectedChunks: event.affected_chunks,
        createdAt: event.created_at,
      })),
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      { error: "Failed to fetch timeline", details: err.message },
      { status: 500 }
    );
  }
}
