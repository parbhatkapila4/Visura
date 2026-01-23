import { openrouterChatCompletion } from "@/lib/openrouter";

function enforceSummaryStructure(summary: string, isShortDocument: boolean): string {
  const sections: Array<{ title: string; content: string; index: number }> = [];
  const seenHeaders = new Set<string>();
  
  const lines = summary.split('\n');
  let currentSection: { title: string; content: string[] } | null = null;
  let sectionIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^###\s+(.+)$/);
    
    if (headerMatch) {
      const headerTitle = headerMatch[1].trim().toLowerCase();
      
      if (currentSection) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
          index: sectionIndex++,
        });
      }
      
      if (seenHeaders.has(headerTitle)) {
        currentSection = null;
        continue;
      }
      
      seenHeaders.add(headerTitle);
      currentSection = {
        title: headerMatch[1].trim(),
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }
  
  if (currentSection) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
      index: sectionIndex++,
    });
  }
  
  const uniqueSections = sections.slice(0, 5);
  
  const expectedSections = isShortDocument
    ? ['Executive Summary', 'Key Insights', 'Evidence & Signals', 'Risks & Gaps', 'Action']
    : ['Should I Care?', 'Core Mental Models', 'High-Signal Sections', 'Actionable Takeaways', 'Risks & Limits'];
  
  const finalSections: string[] = [];
  
  for (const expected of expectedSections) {
    const found = uniqueSections.find(s => 
      s.title.toLowerCase().includes(expected.toLowerCase()) ||
      expected.toLowerCase().includes(s.title.toLowerCase())
    );
    
    if (found) {
      finalSections.push(`### ${found.title}\n\n${found.content}`);
    }
  }
  
  if (finalSections.length === 0 && uniqueSections.length > 0) {
    return uniqueSections.slice(0, 5).map(s => `### ${s.title}\n\n${s.content}`).join('\n\n');
  }
  
  return finalSections.join('\n\n');
}

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

    console.log("Calling OpenRouter API for summary generation...");
    const summary = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are Visura. You summarize documents for startup founders. 

RULES:
1. Output EXACTLY ${isShortDocument ? '5' : '5'} sections. No more, no less.
2. Each section header appears ONCE. Never repeat a section.
3. Every sentence must support a decision, establish risk/credibility, or surface real-world relevance.
4. No fluff. No academic tone. No repetition.
5. Founder-focused = actionable, direct, signal-focused.`,
        },
        {
          role: "user",
          content: `Document: ${estimatedPages} pages (${pdfText.length} chars)

${isShortDocument ? `OUTPUT EXACTLY 5 SECTIONS IN THIS ORDER:

### Executive Summary
- 3-5 bullets: what this is, why it matters, what decision it informs
- ONE paragraph max

### Key Insights  
- 5-8 bullet points of non-obvious insights
- No restating obvious content

### Evidence & Signals
- Concrete data points, examples, claims
- Call out weak/missing evidence explicitly

### Risks & Gaps
- What could be wrong
- What's assumed but not proven
- Where this fails

### Action
- What the reader should do next
- If no action: say "No immediate action required"` : `OUTPUT EXACTLY 5 SECTIONS IN THIS ORDER:

### Should I Care?
- Core thesis (1-2 sentences)
- Intended audience
- When useful / when not useful

### Core Mental Models
- 5-7 key ideas or frameworks
- One line each
- NO chapter-by-chapter breakdowns

### High-Signal Sections
- 3-5 most valuable sections
- Why each matters
- Be honest if value is uneven

### Actionable Takeaways
- Decisions this informs
- Behaviors it encourages/discourages
- Practical implications

### Risks & Limits
- Weak assumptions
- Outdated thinking
- Contexts where this fails`}

────────────────────────
CRITICAL CONSTRAINTS:
────────────────────────
- EXACTLY ${isShortDocument ? '5' : '5'} sections. Count them before responding.
- Each section header appears ONCE. Check for duplicates.
- No repeating "Executive Summary" or any other section.
- No numbered lists within sections unless specified.
- No sub-sections. Just the 5 main sections above.
- If document is fiction/novel: focus on themes, character arcs, plot structure, not chapter summaries.

DOCUMENT TEXT:
${textToSummarize}

Now generate the summary with EXACTLY ${isShortDocument ? '5' : '5'} sections, no repetition.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
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

    const cleanedSummary = enforceSummaryStructure(summary, isShortDocument);
    
    return cleanedSummary;
  } catch (error: any) {
    console.error("Summary generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
