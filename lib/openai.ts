import { openrouterChatCompletion } from "@/lib/openrouter";

export async function generateSummaryFromText(pdfText: string) {
  try {
    console.log("Starting summary generation...");
    console.log("Text length:", pdfText.length);
    console.log("First 200 chars:", pdfText.substring(0, 200));

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Text content too short to generate summary");
    }

    const estimatedPages = Math.ceil(pdfText.length / 1900);
    const isShortDocument = estimatedPages <= 15;

    console.log(`Estimated document length: ${estimatedPages} pages (${isShortDocument ? 'SHORT' : 'LONG'} mode)`);

    const textToSummarize =
      pdfText.length > 200000
        ? pdfText.substring(0, 200000) +
        "\n\n[Content truncated for processing - document is very long]"
        : pdfText;

    const summary = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are Visura, an AI document summarizer built for startup founders.

Your core principle:
Founders want SIGNAL, not noise.
Every sentence must either:
(a) support a decision
(b) establish credibility or risk
(c) surface real-world relevance
Anything else is removed.`,
        },
        {
          role: "user",
          content: `────────────────────────
STEP 1 — CLASSIFY DOCUMENT
────────────────────────

First, determine document length:

- SHORT DOCUMENT = 15 pages or less (≈ 7,000 tokens / 28,000 characters)
- LONG DOCUMENT = more than 15 pages

Document text length: ${pdfText.length} characters (estimated ${estimatedPages} pages)
Classification: ${isShortDocument ? 'SHORT DOCUMENT' : 'LONG DOCUMENT'}

You MUST follow the rules for the detected category.
Do not mix formats.

${isShortDocument ? `────────────────────────
SHORT DOCUMENT MODE
(≤ 15 pages)
────────────────────────

GOAL:
Help the reader fully understand the document quickly and act.

ASSUMPTION:
This document is short enough to be absorbed end-to-end.

OUTPUT FORMAT (MANDATORY):

### Executive Summary
- 4–6 bullets
- What this document is about
- Why it matters
- What decision or action it informs

### Key Insights
- Bullet points only
- Non-obvious insights
- No restating obvious content

### Evidence & Signals
- Data points, examples, or concrete claims
- Explicitly call out weak or missing evidence

### Risks, Assumptions, or Gaps
- What could be wrong
- What is assumed but not proven

### Recommended Action
- What the reader should do next
- If no action is justified, say so clearly

STYLE RULES:
- Direct, concise language
- No academic tone
- No filler
- No emojis

GUARDRAIL:
If the document has low actionable signal, say so explicitly.` : `────────────────────────
LONG DOCUMENT MODE
(> 15 pages)
────────────────────────

GOAL:
Guide understanding honestly instead of pretending to compress everything.

IMPORTANT:
No one can fully learn a long document or book from a short summary.
Do NOT attempt to summarize everything.

OUTPUT FORMAT (MANDATORY):

### Orientation Summary (Should I Care?)
- Core thesis (1–2 sentences)
- Intended audience
- When this document is useful
- When it is not useful

### Core Mental Models
- 5–7 key ideas or frameworks
- One line each
- Avoid chapter-by-chapter breakdowns

### High-Signal Sections
- Most valuable chapters or sections
- Why each is worth reading
- Be honest if value is uneven

### Actionable Takeaways
- Decisions this document informs
- Behaviors it encourages or discourages
- Practical implications

### Risks, Limits, or Gaps
- Weak assumptions
- Outdated thinking
- Contexts where this advice fails

STYLE RULES:
- Clear, blunt, honest language
- No academic tone
- No filler
- No fake certainty

GUARDRAIL:
If the document is bloated, repetitive, or low-signal, say so plainly.
Do not pretend everything is important.`}

────────────────────────
FINAL CHECK
────────────────────────

Before responding:
- Remove any sentence that does not create decision value
- Do NOT invent facts, metrics, or confidence
- Do NOT exaggerate conclusions

Now process the uploaded document using the correct mode.

HERE IS THE COMPLETE TEXT TO ANALYZE:

${textToSummarize}

────────────────────────

CRITICAL INSTRUCTIONS:
- Extract information directly from the document text provided above
- Focus on SIGNAL: decision support, credibility/risk, real-world relevance
- Remove noise: filler, obvious statements, academic fluff
- Be honest about gaps, weak evidence, or low-signal content
- Write in direct, founder-friendly language
- Every section must create actionable value`,
        },
      ],
      temperature: 0.3,
      max_tokens: 12000,
    });

    console.log("Summary generated successfully!");
    console.log("Summary length:", summary?.length || 0);

    if (!summary || summary.trim().length < 100) {
      throw new Error("AI returned empty or very short summary");
    }

    if (
      summary.toLowerCase().includes("i cannot access") ||
      summary.toLowerCase().includes("i apologize") ||
      summary.toLowerCase().includes("unable to access")
    ) {
      console.error("AI is confused - returning confused response");
      throw new Error("AI model is confused about having access to content");
    }

    return summary;
  } catch (error: any) {
    console.error("Summary generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
