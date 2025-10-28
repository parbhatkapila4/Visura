import { openrouterChatCompletion } from "@/lib/openrouter";
import { getQASessionById, getQAMessagesBySession } from "./chatbot";

const CHATBOT_SYSTEM_PROMPT = `You are a document assistant that helps users understand PDF content. Answer questions based on the document text only. If information isn't in the document, say so. Provide page references when possible. Keep responses clear and relevant to the document.`;

export async function generateChatbotResponse(
  sessionId: string,
  userMessage: string,
  userId: string
): Promise<string> {
  try {
    const session = await getQASessionById(sessionId, userId);
    if (!session) {
      throw new Error("Session not found");
    }

    const messages = await getQAMessagesBySession(sessionId, userId);

    const conversationHistory = messages.map((msg) => ({
      role:
        msg.message_type === "user"
          ? ("user" as const)
          : ("assistant" as const),
      content: msg.message_content,
    }));

    const pdfContext = `
PDF Document: ${session.title || session.file_name}
Full Document Content:
${session.full_text_content}

User's Question: ${userMessage}

Please answer the user's question based on the PDF content above. If the question cannot be answered from the document content, please let the user know.
`;

    const aiMessages = [
      {
        role: "system" as const,
        content: CHATBOT_SYSTEM_PROMPT,
      },
      ...conversationHistory.slice(-10),
      {
        role: "user" as const,
        content: pdfContext,
      },
    ];

    const response = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: aiMessages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    return response;
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      sessionId,
      userId,
    });
    return "I apologize, but I encountered an error while processing your question. Please try again.";
  }
}

export async function generateInitialChatbotGreeting(
  pdfTitle: string
): Promise<string> {
  return `Hi! I can help you understand "${pdfTitle}". Ask me about key points, specific sections, or anything else in the document.`;
}
