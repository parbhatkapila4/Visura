import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";

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

    const versions = await sql`
      SELECT 
        version_number,
        total_chunks,
        reused_chunks,
        new_chunks,
        estimated_tokens_saved,
        created_at
      FROM document_versions
      WHERE document_id = ${id}
      ORDER BY version_number ASC
    `;

    return NextResponse.json({
      documentId: id,
      versions: versions.map((v: any) => ({
        versionNumber: v.version_number,
        totalChunks: v.total_chunks,
        reusedChunks: v.reused_chunks,
        newChunks: v.new_chunks,
        estimatedTokensSaved: v.estimated_tokens_saved,
        createdAt: v.created_at,
      })),
    });
  } catch (error) {
    console.error("Get versions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
