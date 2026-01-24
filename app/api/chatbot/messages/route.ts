import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveQAMessage, getQAMessagesBySession } from "@/lib/chatbot";
import { generateChatbotResponse, generateChatbotResponseStream } from "@/lib/chatbot-ai";
import { SendMessageSchema, GetMessagesSchema } from "@/lib/validators";
import { chatbotRateLimit, checkRateLimit, trackRateLimitHit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { measurePerformance } from "@/lib/performance-monitor";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitCheck = await checkRateLimit(chatbotRateLimit, userId);
    if (!rateLimitCheck.allowed) {
      trackRateLimitHit("/api/chatbot/messages", userId);
      return rateLimitCheck.response;
    }

    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);
    const { sessionId, message, stream } = validatedData;

    const userMessage = await saveQAMessage({
      sessionId,
      messageType: "user",
      messageContent: message,
    });

    if (stream) {
      return await measurePerformance(
        "chatbot_stream_response",
        async () => {
          const stream = await generateChatbotResponseStream(sessionId, message, userId);

          let fullResponse = "";
          const encoder = new TextEncoder();

          const readable = new ReadableStream({
            async start(controller) {
              try {
                const reader = stream.getReader();
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = new TextDecoder().decode(value);
                  fullResponse += chunk;
                  controller.enqueue(encoder.encode(chunk));
                }

                await saveQAMessage({
                  sessionId,
                  messageType: "assistant",
                  messageContent: fullResponse,
                });

                controller.close();
              } catch (error) {
                logger.error("Streaming error", error, { sessionId, userId });
                controller.error(error);
              }
            },
          });

          return new NextResponse(readable, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        },
        { userId, sessionId, stream: "true" }
      );
    }

    const aiResponse = await measurePerformance(
      "chatbot_response",
      async () => {
        return await generateChatbotResponse(sessionId, message, userId);
      },
      { userId, sessionId }
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
    logger.error("Error processing chatbot message", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
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

    const { sessionId } = GetMessagesSchema.parse({ sessionId: sessionIdParam });

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const messages = await getQAMessagesBySession(sessionId, userId);
    return NextResponse.json({ messages });
  } catch (error) {
    logger.error("Error fetching QA messages", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
