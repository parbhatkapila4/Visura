import { logger } from "./logger";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const APP_REFERER = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_TITLE = "Visura";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface EmbeddingOptions {
  model?: string;
  input: string;
}

export async function openrouterChatCompletion(options: ChatCompletionOptions): Promise<string> {
  const { model = "openai/gpt-4o-mini", messages, temperature = 0.7, max_tokens } = options;

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": APP_REFERER,
    "X-Title": APP_TITLE,
  };

  const tryModels = [model, "anthropic/claude-3.5-haiku", "openai/gpt-4o-mini", "google/gemini-2.0-flash-exp"];

  for (let i = 0; i < tryModels.length; i++) {
    const m = tryModels[i];
    try {
      logger.info("Trying OpenRouter model", {
        model: m,
        attempt: i + 1,
        total: tryModels.length,
      });

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: m, messages, temperature, max_tokens }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? "";

        if (!content || content.trim().length === 0) {
          logger.warn("Model returned empty content, trying next", { model: m });
          if (i < tryModels.length - 1) {
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }
        }

        logger.info("OpenRouter model success", { model: m });
        return content;
      }

      const errorText = await response.text();
      logger.error("OpenRouter model failed", undefined, {
        model: m,
        status: response.status,
        error: errorText.substring(0, 200),
      });

      if ([402, 429, 400, 403, 503].includes(response.status) && i < tryModels.length - 1) {
        logger.info("Retrying with next model", { currentModel: m });
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    } catch (err) {
      logger.error("Error with OpenRouter model", err, { model: m });

      if (i < tryModels.length - 1) {
        logger.info("Trying next fallback model", { currentModel: m });
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      throw err;
    }
  }

  throw new Error("All model attempts failed");
}

export async function openrouterSingleMessage(prompt: string, model?: string): Promise<string> {
  return openrouterChatCompletion({
    model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
}
