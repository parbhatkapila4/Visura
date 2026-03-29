import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveQAMessage, getQAMessagesBySession, getSessionDocumentRef } from "@/lib/chatbot";
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
          const { getSourcesForTurn } = await import("@/lib/chatbot-ai");

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

                const sources = await getSourcesForTurn(sessionId, message, userId);
                await saveQAMessage({
                  sessionId,
                  messageType: "assistant",
                  messageContent: fullResponse,
                  sources,
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

    const { answer, sources } = await measurePerformance(
      "chatbot_response",
      async () => {
        return await generateChatbotResponse(sessionId, message, userId);
      },
      { userId, sessionId }
    );

    const assistantMessage = await saveQAMessage({
      sessionId,
      messageType: "assistant",
      messageContent: answer,
      sources,
    });

    const ref = await getSessionDocumentRef(sessionId, userId);
    const sourcesWithRef = sources.map((s) => ({
      ...s,
      document_version_id: ref.document_version_id ?? undefined,
      pdf_summary_id: ref.pdf_summary_id ?? undefined,
    }));

    return NextResponse.json({
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        message_content: answer,
        sources: sourcesWithRef,
      },
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

    const rawMessages = await getQAMessagesBySession(sessionId, userId);
    const ref = await getSessionDocumentRef(sessionId, userId);
    const messages = rawMessages.map((m: { sources?: unknown }) => {
      let sources = m.sources;
      if (Array.isArray(sources)) {
      } else if (typeof sources === "string") {
        try {
          const p = JSON.parse(sources);
          sources = Array.isArray(p) ? p : [];
        } catch {
          sources = [];
        }
      } else {
        sources = [];
      }
      const enrichedSources = (sources as Array<{ page?: number | null; snippet?: string; chunk_id?: string | null }>).map(
        (s) => ({
          ...s,
          document_version_id: ref.document_version_id ?? undefined,
          pdf_summary_id: ref.pdf_summary_id ?? undefined,
        })
      );
      return { ...m, sources: enrichedSources };
    });
    return NextResponse.json({ messages });
  } catch (error) {
    logger.error("Error fetching QA messages", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
