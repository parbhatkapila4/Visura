import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveQAMessage, getQAMessagesBySession } from "@/lib/chatbot";
import { generateChatbotResponse } from "@/lib/chatbot-ai";
import { SendMessageSchema, GetMessagesSchema } from "@/lib/validators";
import { chatbotRateLimit, checkRateLimit, trackRateLimitHit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(chatbotRateLimit, userId);
    if (!rateLimitCheck.allowed) {
      trackRateLimitHit('/api/chatbot/messages', userId);
      return rateLimitCheck.response;
    }

    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = SendMessageSchema.parse(body);
    const { sessionId, message } = validatedData;

    const userMessage = await saveQAMessage({
      sessionId,
      messageType: "user",
      messageContent: message,
    });

    const aiResponse = await generateChatbotResponse(
      sessionId,
      message,
      userId
    );

    const assistantMessage = await saveQAMessage({
      sessionId,
      messageType: "assistant",
      messageContent: aiResponse,
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Error processing chatbot message:", error);
    
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionIdParam = searchParams.get("sessionId");
    
    // Validate query parameters
    const { sessionId } = GetMessagesSchema.parse({ sessionId: sessionIdParam });

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const messages = await getQAMessagesBySession(sessionId, userId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching QA messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
