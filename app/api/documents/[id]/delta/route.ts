import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { computeDocumentDelta } from "@/lib/document-delta";

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

    const delta = await computeDocumentDelta(id);

    return NextResponse.json({
      documentId: id,
      delta,
    });
  } catch (error) {
    console.error("Get delta error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
