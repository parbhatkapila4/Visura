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
          content: `I have extracted the complete text from a PDF. Below is the FULL TEXT CONTENT. Please analyze it and create a detailed summary.

FORMAT YOUR SUMMARY LIKE THIS:

# [Create appropriate title based on content]

## Overview
- Document type and purpose
- Target audience  
- Main topic

## Executive Summary
- Key findings
- Main insights
- Critical points

## Key Points
- Important information point 1
- Important information point 2
- Important information point 3

## Analysis
- Detailed topic 1
- Detailed topic 2
- Detailed topic 3

## Recommendations
- Actionable step 1
- Actionable step 2

---

HERE IS THE COMPLETE TEXT TO ANALYZE:

${textToSummarize}

---

Now create the summary based on the text above.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
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
