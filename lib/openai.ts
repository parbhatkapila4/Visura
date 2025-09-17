import { openrouterChatCompletion } from "@/lib/openrouter";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

export async function generateSummaryFromOpenAI(pdfText: string) {
  try {
    const summary = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze this document comprehensively and create a detailed, actionable summary that provides deep insights and practical value. Focus on extracting key information, identifying important patterns, and providing clear recommendations. Ensure the summary is thorough, well-structured, and immediately useful for decision-making:\n\n${pdfText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });
    return summary;
  } catch (error: any) {
    console.error("OpenRouter error:", error);
    throw error;
  }
}
