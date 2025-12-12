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

    // Increase limit for more detailed analysis - process more content
    const textToSummarize = pdfText.length > 200000 
      ? pdfText.substring(0, 200000) + "\n\n[Content truncated for processing - document is very long]"
      : pdfText;

    const summary = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an expert document analyst and deep content researcher with exceptional analytical capabilities. You will receive the FULL TEXT of a document. Your job is to perform an exhaustive, meticulous analysis that goes far beyond surface-level reading. You must identify patterns, hidden connections, subtle implications, and insights that are difficult for humans to notice. The text is already extracted and provided to you - you have full access to it. Your analysis must be extremely detailed, comprehensive, and lengthy.`,
        },
        {
          role: "user",
          content: `I have extracted the complete text from a PDF. Below is the FULL TEXT CONTENT. You must perform a DEEP, EXHAUSTIVE analysis that uncovers everything important - including subtle details, hidden patterns, implicit meanings, and insights that are difficult for humans to detect. Create an extremely detailed, comprehensive, and lengthy summary following this exact structure:

# [Document Title]

## Core Thesis / Main Argument

[Provide an EXTENSIVE analysis of the document's central claim. Go beyond the obvious - identify the underlying philosophy, the deeper purpose, and what the author is really trying to prove. Include:
- The explicit thesis statement
- The implicit or hidden thesis
- The philosophical foundation
- The worldview or perspective being presented
- How this argument connects to broader themes
- What assumptions underlie this argument
- Extract and quote specific passages that reveal the core argument]

## Key Problem Being Solved

[Provide a COMPREHENSIVE analysis of the problem. Don't just state it - analyze it deeply:
- The explicit problem stated in the document
- Hidden or implicit problems that aren't directly mentioned
- Why this problem exists (root causes)
- Who is affected and how (detailed stakeholder analysis)
- The consequences if this problem isn't solved
- Historical context or background of the problem
- How the problem has evolved or changed
- Extract specific examples, case studies, or scenarios from the PDF]

## Fundamental Concepts / Mental Models

[Identify and EXPLAIN IN DETAIL 5-10 core ideas, frameworks, or mental models. For each concept:
- Provide a detailed explanation (not just a brief description)
- Explain how it works and why it matters
- Show how concepts interconnect and build on each other
- Identify the underlying principles
- Explain the theoretical foundation
- Show practical applications
- Include specific examples from the PDF
- Identify any novel or innovative aspects
- Explain how these concepts challenge or extend existing knowledge]

## Evidence & Research

[Provide a THOROUGH analysis of all evidence. Don't just list it - analyze it:
- Every key study, research finding, or data point mentioned
- The methodology behind the research (if mentioned)
- Statistical significance and implications
- Real-world examples and case studies in detail
- Credibility assessment of sources
- Contradictory evidence or limitations mentioned
- Trends or patterns in the data
- What the evidence actually proves vs. what it suggests
- Extract specific numbers, percentages, dates, and statistics
- Analyze the quality and reliability of evidence]

## Practical Framework / System

[Provide a DETAILED breakdown of any methodology, process, or system:
- Step-by-step explanation of every stage
- Prerequisites and requirements for each step
- Tools, resources, or conditions needed
- Common pitfalls and how to avoid them
- Variations or adaptations possible
- Integration with other systems or processes
- Success metrics or indicators
- Timeline or sequence considerations
- Extract all procedural details from the PDF]

## Hidden Patterns & Subtle Insights

[This is CRITICAL - identify things that are hard for humans to notice:
- Recurring themes that appear in different sections
- Contradictions or tensions within the document
- Implicit assumptions that aren't stated
- Patterns in language, structure, or presentation
- What's emphasized vs. what's downplayed
- Connections between seemingly unrelated sections
- Subtext or implied meanings
- Cultural, historical, or contextual implications
- What the document reveals indirectly
- Gaps or omissions that are significant
- Subtle shifts in tone, perspective, or focus]

## Common Objections & Rebuttals

[Provide a COMPREHENSIVE analysis:
- All counterarguments addressed in the document
- Objections that are implied but not directly stated
- Limitations explicitly mentioned
- Edge cases or exceptions
- Situations where the approach doesn't apply
- How the document handles criticism
- Weaknesses in the argument (if any)
- Areas where more evidence would strengthen the case
- Extract all objections and rebuttals with context]

## Critical Success Factors

[Provide DETAILED analysis of what makes things work or fail:
- Non-negotiable elements (explain why each is critical)
- Prerequisites and dependencies
- Environmental or contextual requirements
- Skills, knowledge, or resources needed
- Timing or sequence requirements
- Common failure modes and their causes
- Warning signs or red flags
- Success indicators and metrics
- Risk factors and mitigation strategies
- Extract all success/failure criteria from the PDF]

## Actionable Takeaways

[Provide 10-15 SPECIFIC, DETAILED actions:
- For each action, explain:
  * What exactly to do (step-by-step)
  * Why it matters
  * When to do it
  * What resources are needed
  * Potential challenges and solutions
  * Expected outcomes
- Prioritize actions by importance or sequence
- Include both immediate and long-term actions
- Extract concrete, implementable items from the PDF]

## Paradigm Shifts / Counterintuitive Insights

[Identify and EXPLAIN IN DEPTH:
- Every insight that challenges conventional wisdom
- Why conventional approaches fail
- What makes these insights surprising
- The implications of these shifts
- How they change understanding of the topic
- Real-world examples of these paradigm shifts
- Historical context or evolution of these ideas
- Extract all counterintuitive elements from the PDF]

## Advanced Analysis & Deep Insights

[This section is for sophisticated analysis that goes beyond the obvious:
- Interdisciplinary connections (how this relates to other fields)
- Long-term implications and second-order effects
- Systemic impacts and ripple effects
- Ethical considerations
- Future trends or predictions implied
- Meta-analysis of the document's structure and approach
- What experts in the field would notice
- Critical evaluation of the document's strengths and weaknesses
- How this fits into broader knowledge or discourse]

## Relevance & Application to Different Contexts

[Provide DETAILED analysis of applications:
- How concepts apply in different industries/fields
- Adaptations needed for different contexts
- What works universally vs. what's context-specific
- Case studies or examples from different domains
- Implementation challenges in various settings
- Scalability considerations
- Cultural or regional adaptations
- Extract all application examples from the PDF]

## Comprehensive Summary of Whole PDF

[Provide an EXTENSIVE, DETAILED summary that:
- Covers every major section, chapter, or topic
- Explains the flow and structure of the document
- Captures all key themes and sub-themes
- Includes important details, examples, and data points
- Shows how different parts connect
- Highlights the most important insights
- Provides context and background
- Is lengthy and thorough (aim for 500-1000 words minimum)
- Leaves no important aspect unaddressed]

## Key Quotes & Important Passages

[Extract and analyze:
- The most significant quotes from the document
- Passages that capture core ideas
- Memorable or impactful statements
- Technical definitions or explanations
- Important data or statistics in their original wording
- For each quote, explain why it's significant]

## Additional Observations & Nuances

[Include any other important details:
- Interesting asides or tangents that add value
- Footnotes or references that are significant
- Formatting or structural elements that convey meaning
- Visual elements described in text
- Appendices or supplementary material
- Anything else that adds depth to understanding]

---

HERE IS THE COMPLETE TEXT TO ANALYZE:

${textToSummarize}

---

CRITICAL INSTRUCTIONS FOR MAXIMUM DETAIL:
- This MUST be an extremely detailed, comprehensive, and lengthy summary (aim for 3000-5000+ words total)
- Extract information directly from the PDF text provided above
- Each section must be THOROUGHLY explained with extensive detail - not brief summaries
- Identify patterns, connections, and insights that are difficult for humans to notice
- Look for hidden meanings, implicit assumptions, and subtle implications
- Include specific examples, quotes, numbers, dates, and data from the PDF
- Analyze not just what is said, but how it's said and what it implies
- Connect different parts of the document to reveal deeper understanding
- If a section doesn't directly apply, adapt it creatively to what the document actually contains
- Be exhaustive - leave no important detail unaddressed
- Write in clear, professional language but be comprehensive
- The summary should be so detailed that someone reading it feels they've read the entire document
- Focus on insights that require deep analysis to uncover

Now create an extremely detailed, comprehensive, and lengthy summary based on the text above, following the exact structure provided. Make it thorough enough that it captures everything important, including subtle details that are hard for humans to notice.`,
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
