import { openrouterChatCompletion } from "@/lib/openrouter";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

export async function generateSummaryFromText(pdfText: string) {
  try {
    console.log("Starting summary generation...");
    console.log("Text length:", pdfText.length);
    console.log("First 200 chars:", pdfText.substring(0, 200));

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Text content too short to generate summary");
    }

    const textToSummarize = pdfText.length > 100000 
      ? pdfText.substring(0, 100000) + "\n\n[Content truncated for processing]"
      : pdfText;

    const summary = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a professional document analyzer. You will receive the FULL TEXT of a document. Your job is to analyze the text provided and create a comprehensive summary. The text is already extracted and provided to you - you have full access to it.`,
        },
        {
          role: "user",
          content: `I have extracted the complete text from a PDF. Below is the FULL TEXT CONTENT. Please analyze it thoroughly and create a comprehensive summary following this exact structure:

# [Document Title]

## Core Thesis / Main Argument

[Provide the document's central claim in 2-3 sentences. What is the main argument or thesis? What is the author trying to prove or convince you of? This is the foundation everything else builds on. Extract this directly from the PDF content.]

## Key Problem Being Solved

[What gap, pain point, or question does this document address? Why does this problem matter? Who is affected by it? Extract specific details from the PDF about the problem being addressed.]

## Fundamental Concepts / Mental Models

[Identify the 3-5 core ideas or frameworks introduced in the document. These are the thinking tools that change how you understand the topic. List each concept with a brief explanation based on the PDF content.]

## Evidence & Research

[What key studies, data points, statistics, or real-world examples does the document use to support its argument? What makes this credible? Extract specific evidence, numbers, and examples from the PDF.]

## Practical Framework / System

[What step-by-step methodology, process, or system does the document propose? This is the 'how-to' distilled to its essence. Extract the practical framework from the PDF content.]

## Common Objections & Rebuttals

[What counterarguments does the document address? What are the limitations or edge cases where the approach doesn't work? Extract any objections and rebuttals mentioned in the PDF.]

## Critical Success Factors

[What makes the approach in the document work or fail? What are the non-negotiable elements, prerequisites, or conditions required? Extract these from the PDF content.]

## Actionable Takeaways

[List 5-10 specific actions someone can implement immediately based on the document. These should be concrete, not abstract advice. Extract actionable items directly from the PDF.]

## Paradigm Shifts / Counterintuitive Insights

[What did the document reveal that challenges conventional wisdom? What surprising insights or counterintuitive ideas does it present? Extract these from the PDF content.]

## Relevance & Application to Your Context

[How does the content apply to different contexts? What are the practical applications? Extract information about how the concepts can be applied from the PDF.]

## Summary of Whole PDF

[Provide a comprehensive summary of the entire document. This should be a complete overview that captures all major points, themes, and conclusions from the PDF.]

---

HERE IS THE COMPLETE TEXT TO ANALYZE:

${textToSummarize}

---

IMPORTANT INSTRUCTIONS:
- Extract information directly from the PDF text provided above
- Each section must contain detailed explanations based on the actual PDF content
- If a section doesn't directly apply, adapt it to what the document actually contains
- Be thorough and comprehensive in your analysis
- Use specific examples, quotes, and details from the PDF when available
- Write in clear, professional language

Now create the summary based on the text above, following the exact structure provided.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    });

    console.log("Summary generated successfully!");
    console.log("Summary length:", summary?.length || 0);
    
    if (!summary || summary.trim().length < 100) {
      throw new Error("AI returned empty or very short summary");
    }

    if (summary.toLowerCase().includes("i cannot access") || 
        summary.toLowerCase().includes("i apologize") ||
        summary.toLowerCase().includes("unable to access")) {
      console.error("AI is confused - returning confused response");
      throw new Error("AI model is confused about having access to content");
    }

    return summary;
  } catch (error: any) {
    console.error("Summary generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
