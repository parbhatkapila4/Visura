
import { logger } from "./logger";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const APP_REFERER = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_TITLE = "Visura";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface StreamChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}


export async function openrouterStreamChatCompletion(
  options: StreamChatCompletionOptions
): Promise<ReadableStream<Uint8Array>> {
  const {
    model = "openai/gpt-4o-mini",
    messages,
    temperature = 0.7,
    max_tokens,
  } = options;

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": APP_REFERER,
    "X-Title": APP_TITLE,
  };

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("OpenRouter streaming request failed", undefined, {
        model,
        status: response.status,
        error: errorText.substring(0, 200),
      });
      throw new Error(
        `Streaming request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (parseError) {

                  logger.warn("Failed to parse streaming chunk", {
                    line: line.substring(0, 100),
                    error: parseError instanceof Error ? parseError.message : String(parseError),
                  });
                }
              }
            }
          }
        } catch (error) {
          logger.error("Streaming error", error, { model });
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });
  } catch (error) {
    logger.error("OpenRouter streaming error", error, { model });
    throw error;
  }
}
