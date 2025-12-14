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

  const tryModels = [model, "google/gemini-flash-1.5", "meta-llama/llama-3.1-8b-instruct:free"];

  for (let i = 0; i < tryModels.length; i++) {
    const m = tryModels[i];
    try {
      console.log(`Trying model: ${m} (attempt ${i + 1}/${tryModels.length})`);

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: m, messages, temperature, max_tokens }),
      });

      console.log(`Model ${m} response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? "";

        if (!content || content.trim().length === 0) {
          console.warn(`Model ${m} returned empty content, trying next...`);
          if (i < tryModels.length - 1) {
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }
        }

        console.log(`✅ Success with model ${m}`);
        return content;
      }

      const errorText = await response.text();
      console.error(`Model ${m} failed:`, response.status, errorText);

      if ([402, 429, 400, 403, 503].includes(response.status) && i < tryModels.length - 1) {
        console.log(`Retrying with next model...`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    } catch (err) {
      console.error(`Error with model ${m}:`, err);

      if (i < tryModels.length - 1) {
        console.log(`Trying next fallback model...`);
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
