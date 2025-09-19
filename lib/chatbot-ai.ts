import { openrouterChatCompletion } from "@/lib/openrouter";
import { getQASessionById, getQAMessagesBySession } from "./chatbot";

const CHATBOT_SYSTEM_PROMPT = `You are an intelligent assistant that helps users understand and analyze PDF documents. You have access to the full text content of the PDF document that the user is asking about.

Your role is to:
1. Answer questions about the content of the PDF document accurately
2. Provide summaries, explanations, and insights based on the PDF content
3. Help users find specific information within the document
4. Maintain context throughout the conversation
5. Be helpful, accurate, and concise in your responses

Guidelines:
- Always base your answers on the actual content of the PDF document
- If you cannot find information in the document, clearly state that
- Provide page references or section references when possible
- Ask clarifying questions if the user's question is ambiguous
- Keep responses focused and relevant to the PDF content
- If asked about topics not covered in the PDF, politely redirect to the document content

Remember: You should only answer questions related to the PDF document content. Do not provide information from external sources unless it's directly relevant to understanding the document.`;

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
  return `Hello! I'm your AI assistant for this document: "${pdfTitle}". I can help you understand and analyze the content of this PDF. You can ask me questions about:

• Key concepts and main points
• Specific sections or topics
• Summaries of particular parts
• Explanations of complex ideas
• Finding specific information

What would you like to know about this document?`;
}
