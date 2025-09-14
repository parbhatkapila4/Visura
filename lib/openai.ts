import { openrouterChatCompletion } from "@/lib/openrouter";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

export async function generateSummaryFromOpenAI(pdfText: string) {
  try {
    const summary = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Translate this document into an engaging, easy-to-read summary with contextual relevant emojis and proper markdown formatting:\n\n${pdfText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    return summary;
  } catch (error: any) {
    console.error("OpenRouter error:", error);
    throw error;
  }
}
