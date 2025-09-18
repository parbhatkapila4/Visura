import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const diagnostics = {
      environment: {
        openrouterApiKey: !!process.env.OPENROUTER_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        connected: false,
        tables: {
          pdf_stores: false,
          pdf_qa_sessions: false,
          pdf_qa_messages: false,
        }
      }
    };

    // Test database connection and tables
    try {
      const sql = await getDbConnection();
      diagnostics.database.connected = true;

      // Check if tables exist
      const tables = ['pdf_stores', 'pdf_qa_sessions', 'pdf_qa_messages'];
      for (const table of tables) {
        try {
          await sql`SELECT 1 FROM ${sql(table)} LIMIT 1`;
          diagnostics.database.tables[table as keyof typeof diagnostics.database.tables] = true;
        } catch (error) {
          console.error(`Table ${table} not found:`, error);
        }
      }
    } catch (error) {
      console.error("Database connection error:", error);
      diagnostics.database.connected = false;
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
