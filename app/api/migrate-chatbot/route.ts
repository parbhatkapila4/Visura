import { NextRequest, NextResponse } from "next/server";
import { checkChatbotTables, runChatbotSchema } from "@/lib/db-migration";

export async function GET() {
  try {
    const tables = await checkChatbotTables();
    
    return NextResponse.json({
      success: true,
      tables,
      message: "Database status checked"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await runChatbotSchema();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
