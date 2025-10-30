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

export async function openrouterChatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const {
    model = "openai/gpt-4o-mini",
    messages,
    temperature = 0.7,
    max_tokens,
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": APP_REFERER,
    "X-Title": APP_TITLE,
  };

  const tryModels = [
    model,
    "google/gemini-1.5-flash",
    "mistralai/mistral-small"
  ]; // fallbacks adjusted to valid, widely-available routes

  for (let i = 0; i < tryModels.length; i++) {
    const m = tryModels[i];
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: m, messages, temperature, max_tokens }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? "";
      }

      // If 402/429 or model issue, try the next fallback after a brief wait
      if ([402, 429, 400, 403, 503].includes(response.status) && i < tryModels.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const text = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
    } catch (err) {
      if (i < tryModels.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.error("Error processing chat request:", err);
      throw err;
    }
  }

  throw new Error("All model attempts failed");
}

export async function openrouterSingleMessage(
  prompt: string,
  model?: string
): Promise<string> {
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
