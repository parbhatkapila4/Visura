export const parseSection = (section: string): { title: string; points: string[] } => {
    const [title, ...content] = section.split("\n");
  
    const cleanTitle = title.startsWith("#")
      ? title.substring(1).trim()
      : title.trim();
  
    const points: String[] = [];
  
    let currentPoint = "";
  
    content.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("•")) {
        if (currentPoint) points.push(currentPoint.trim());
        currentPoint = trimmedLine;
      } else if (!trimmedLine) {
        if (currentPoint) points.push(currentPoint.trim());
        currentPoint = "";
      } else {
        currentPoint += " " + trimmedLine;
      }
    });
  
    if (currentPoint) points.push(currentPoint.trim());
  
    return {
      title: cleanTitle,
      points: points.filter(
        (point) =>
          point && !point.startsWith("#") && !point.startsWith("[Choose]")
      ) as string[],
    };
  };

export const extractSummaryPreview = (summaryText: string): {
  title: string;
  executiveSummary: string;
  keyPoints: string[];
  documentType: string;
} => {
  if (!summaryText || summaryText.trim() === "") {
    return {
      title: "Document Summary",
      executiveSummary: "No summary available",
      keyPoints: [],
      documentType: "Unknown"
    };
  }

  const sections = summaryText.split("\n#").map(section => section.trim()).filter(Boolean);
  
  // Extract title from first section
  const titleSection = sections[0] || "";
  const titleMatch = titleSection.match(/^#\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim() : "Document Summary";

  // Extract executive summary with multiple fallback patterns
  let executiveSummary = "Summary not available";
  
  // Try different patterns for executive summary
  const patterns = [
    /💡\s*(.+)/,  // Original pattern
    /Executive Summary[:\s]*(.+)/i,  // "Executive Summary:" pattern
    /Summary[:\s]*(.+)/i,  // "Summary:" pattern
    /Overview[:\s]*(.+)/i,  // "Overview:" pattern
  ];

  for (const pattern of patterns) {
    const match = titleSection.match(pattern);
    if (match && match[1] && match[1].trim().length > 10) {
      executiveSummary = match[1].trim();
      break;
    }
  }

  // If still no summary found, try to extract from the first substantial paragraph
  if (executiveSummary === "Summary not available") {
    const lines = titleSection.split('\n').filter(line => line.trim().length > 20);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (!firstLine.startsWith('#') && !firstLine.startsWith('•')) {
        executiveSummary = firstLine;
      }
    }
  }

  // Extract document type from Document Overview section
  let documentType = "Document";
  const overviewSection = sections.find(section => section.includes("Document Overview"));
  if (overviewSection) {
    const typeMatch = overviewSection.match(/📄\s*Type:\s*(.+)/);
    if (typeMatch) {
      documentType = typeMatch[1].trim();
    }
  }

  // Extract key points with multiple fallback patterns
  const keyPoints: string[] = [];
  
  // Try Executive Summary section first
  const executiveSection = sections.find(section => section.includes("Executive Summary"));
  if (executiveSection) {
    const lines = executiveSection.split("\n");
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("•") && (trimmedLine.includes("🚀") || trimmedLine.includes("⭐") || trimmedLine.includes("🔗"))) {
        const cleanPoint = trimmedLine.replace(/^•\s*[🚀⭐🔗]\s*/, "").trim();
        if (cleanPoint && keyPoints.length < 3) {
          keyPoints.push(cleanPoint);
        }
      }
    });
  }

  // If no key points found, try to extract from any section with bullet points
  if (keyPoints.length === 0) {
    sections.forEach(section => {
      const lines = section.split("\n");
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("•") && keyPoints.length < 3) {
          const cleanPoint = trimmedLine.replace(/^•\s*/, "").trim();
          if (cleanPoint && cleanPoint.length > 10) {
            keyPoints.push(cleanPoint);
          }
        }
      });
    });
  }

  return {
    title,
    executiveSummary,
    keyPoints,
    documentType
  };
};