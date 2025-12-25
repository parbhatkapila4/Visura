import { openrouterChatCompletion } from "@/lib/openrouter";
import { getQASessionById, getQAMessagesBySession } from "./chatbot";

const CHATBOT_SYSTEM_PROMPT = `You are a helpful document assistant. The user has uploaded a document (PDF, Word, Excel, PowerPoint, or text file) and I will provide you with the FULL TEXT CONTENT of that document. Your job is to answer questions based ONLY on the text content I provide. The text is extracted and given to you directly - you DO have access to it. Answer questions naturally and helpfully. If something isn't in the provided text, say so.

IMPORTANT: Before answering any question, check if the document content is sample/placeholder text:
- If the document contains Lorem Ipsum text, repeating patterns like "abcd", "1234", or other obvious placeholder/sample content, DO NOT try to analyze or summarize it.
- Instead, simply tell the user: "This appears to be a sample or placeholder document (like Lorem Ipsum or test content) with no meaningful information to analyze. Please upload a genuine document with actual content."
- Only provide detailed analysis and summaries for genuine documents with real, meaningful content.
- If the document is genuine and has actual content (not sample/placeholder text), proceed with your normal helpful analysis.`;

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

    const fullText = session.full_text_content || "";
    
    // Check for sample/placeholder content patterns
    const lowerText = fullText.toLowerCase();
    const isSampleContent =
      lowerText.includes("lorem ipsum") ||
      lowerText.match(/^(abcd\s*)+$/i) ||
      lowerText.match(/^(1234\s*)+$/i) ||
      lowerText.match(/^(test\s*)+$/i) ||
      (lowerText.split(/\s+/).length < 50 && 
       (lowerText.includes("sample") || lowerText.includes("placeholder") || lowerText.includes("dummy")));
    
    if (isSampleContent) {
      return "This appears to be a sample or placeholder document (like Lorem Ipsum or test content) with no meaningful information to analyze. Please upload a genuine document with actual content.";
    }
    
    const hasValidContent =
      fullText &&
      fullText.trim().length > 100 &&
      !fullText.toLowerCase().includes("extraction error") &&
      !fullText.toLowerCase().includes("object.defineproperty") &&
      !fullText.toLowerCase().includes("was unable to access");

    if (!hasValidContent) {
      return `I apologize, but this document doesn't have accessible text content. This usually happens with:

📄 **Scanned documents** - Documents created from scanned images
🔒 **Encrypted files** - Password-protected documents  
💥 **Corrupted files** - Damaged files
🖼️ **Image-only files** - Documents that are purely images without text

**What you can do:**
• Upload a different version of the document
• If it's a scanned document, OCR support is coming soon
• For password-protected files, unlock them first and re-upload
• Make sure the document contains actual text content

The file was uploaded successfully, but without text content, I can't answer questions about it. Please try uploading a document with extractable text content.`;
    }

    const messages = await getQAMessagesBySession(sessionId, userId);

    const conversationHistory = messages.map((msg) => ({
      role: msg.message_type === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.message_content,
    }));

    const pdfContext = `Here is the COMPLETE TEXT CONTENT from the document titled "${
      session.title || session.file_name
    }". This text was extracted and is provided to you directly:

---START OF DOCUMENT TEXT---
${fullText}
---END OF DOCUMENT TEXT---

The user's question about this text is: ${userMessage}

Answer their question based on the text content provided above.`;

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
      model: "openai/gpt-4o-mini",
      messages: aiMessages,
      temperature: 0.4,
      max_tokens: 2000,
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

export async function generateInitialChatbotGreeting(pdfTitle: string): Promise<string> {
  return `Hi! I can help you understand "${pdfTitle}". Ask me about key points, specific sections, or anything else in the document.`;
}
