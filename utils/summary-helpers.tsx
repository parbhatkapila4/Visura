const generateDocumentTypeDescription = (title: string, summaryText: string): string => {
  const titleLower = title.toLowerCase();
  const textLower = summaryText?.toLowerCase() || "";

  if (
    titleLower.includes("invoice") ||
    titleLower.includes("bill") ||
    titleLower.includes("receipt")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("profile") ||
    titleLower.includes("resume") ||
    titleLower.includes("cv")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("contract") ||
    titleLower.includes("agreement") ||
    titleLower.includes("terms")
  ) {
    return "No preview available";
  }

  if (titleLower.includes("report") || titleLower.includes("analysis")) {
    return "No preview available";
  }

  if (titleLower.includes("statement") || titleLower.includes("account")) {
    return "No preview available";
  }

  if (
    titleLower.includes("book") ||
    textLower.includes("chapter") ||
    textLower.includes("author")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("manual") ||
    titleLower.includes("guide") ||
    titleLower.includes("instruction")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("letter") ||
    titleLower.includes("email") ||
    titleLower.includes("mail")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("presentation") ||
    titleLower.includes("slides") ||
    titleLower.includes("ppt")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("certificate") ||
    titleLower.includes("diploma") ||
    titleLower.includes("degree")
  ) {
    return "No preview available";
  }

  if (
    titleLower.includes("medical") ||
    titleLower.includes("health") ||
    titleLower.includes("prescription")
  ) {
    return "No preview available";
  }

  if (titleLower.includes("legal") || titleLower.includes("court") || titleLower.includes("case")) {
    return "No preview available";
  }

  if (
    titleLower.includes("business") ||
    titleLower.includes("company") ||
    titleLower.includes("corporate")
  ) {
    return "No preview available";
  }

  if (title.length > 30) {
    return "No preview available";
  }

  return "No preview available";
};

export const parseSection = (section: string): { title: string; points: string[] } => {
  const [title, ...content] = section.split("\n");

  let cleanTitle = title.startsWith("#") ? title.substring(1).trim() : title.trim();

  cleanTitle = cleanTitle.replace(/^\d+\.\s*/, "");

  const points: string[] = [];

  let currentPoint = "";
  let hasBulletPoints = false;

  content.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("•")) {
      hasBulletPoints = true;
    }
  });

  if (hasBulletPoints) {
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
  } else {
    const paragraphs: string[] = [];
    let currentParagraph = "";

    content.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        if (currentParagraph.trim()) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = "";
        }
      } else if (!trimmedLine.startsWith("#") && !trimmedLine.startsWith("[Choose]")) {
        currentParagraph += (currentParagraph ? " " : "") + trimmedLine;
      }
    });

    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }

    points.push(...paragraphs.filter((p) => p.length > 0));
  }

  return {
    title: cleanTitle,
    points: points.filter(
      (point) =>
        point &&
        point.trim().length > 0 &&
        !point.startsWith("#") &&
        !point.startsWith("[Choose]") &&
        !point.toLowerCase().startsWith("type:")
    ) as string[],
  };
};

export const extractSummaryPreview = (
  summaryText: string,
  title?: string | null,
  fileName?: string | null
): {
  title: string;
  executiveSummary: string;
  keyPoints: string[];
  documentType: string;
} => {
  if (!summaryText || summaryText.trim() === "") {
    return {
      title: "Document Summary",
      executiveSummary: "No summary yet",
      keyPoints: [],
      documentType: "Document",
    };
  }

  const extractKeyPointsFromMarkdown = (text: string): string[] => {
    const patterns: RegExp[] = [
      /##\s*Key Points\s*\n([\s\S]*?)(?=\n##\s|\n#\s[^\n]|\n\*\*[A-Za-z]|\n\n\n|$)/i,
      /\*\*Key Points:\*\*\s*\n([\s\S]*?)(?=\n##|\n\*\*[A-Za-z]|\n#\s|$)/i,
    ];
    for (const re of patterns) {
      const block = text.match(re);
      if (!block?.[1]) continue;
      const out: string[] = [];
      for (const line of block[1].split("\n")) {
        const t = line.trim();
        if (/^[-*•]\s+/.test(t)) {
          out.push(t.replace(/^[-*•]\s+/, "").trim());
        }
      }
      if (out.length) return out.slice(0, 20);
    }
    return [];
  };

  const inlineDocumentType =
    summaryText.match(/\*\*Document Type:\*\*\s*([^\n\r]+)/i)?.[1]?.trim() ??
    summaryText.match(/^\s*Document Type:\s*([^\n\r]+)/im)?.[1]?.trim();

  const sections = summaryText
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean);

  const titleSection = sections[0] || "";
  const titleMatch = titleSection.match(/^#\s*(.+)/);
  const extractedTitle = titleMatch ? titleMatch[1].trim() : title || "Document Summary";
  const docTitle = title || extractedTitle;
  const docFileName = fileName || "";

  let executiveSummary = "Summary not available";

  const patterns = [
    /💡\s*(.+)/,
    /Executive Summary[:\s]*(.+)/i,
    /Summary[:\s]*(.+)/i,
    /Overview[:\s]*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = titleSection.match(pattern);
    if (match && match[1] && match[1].trim().length > 10) {
      executiveSummary = match[1].trim();
      break;
    }
  }

  if (executiveSummary === "Summary not available") {
    const lines = titleSection.split("\n").filter((line) => line.trim().length > 20);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (!firstLine.startsWith("#") && !firstLine.startsWith("•")) {
        executiveSummary = firstLine;
      }
    }
  }

  if (executiveSummary === "Summary not available") {
    const searchText = `${docTitle} ${docFileName} ${summaryText}`;
    executiveSummary = generateDocumentTypeDescription(docTitle, searchText);
  }

  let documentType = inlineDocumentType || "Document";
  const overviewSection = sections.find((section) => section.includes("Document Overview"));
  if (overviewSection) {
    const typeMatch = overviewSection.match(/📄\s*Type:\s*(.+)/);
    if (typeMatch) {
      documentType = typeMatch[1].trim();
    }
  }

  const keyPoints: string[] = [...extractKeyPointsFromMarkdown(summaryText)];

  const executiveSection = sections.find((section) => section.includes("Executive Summary"));
  if (executiveSection) {
    const lines = executiveSection.split("\n");
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith("•") &&
        (trimmedLine.includes("🚀") || trimmedLine.includes("⭐") || trimmedLine.includes("🔗"))
      ) {
        const cleanPoint = trimmedLine.replace(/^•\s*[🚀⭐🔗]\s*/, "").trim();
        if (cleanPoint && keyPoints.length < 20) {
          keyPoints.push(cleanPoint);
        }
      }
    });
  }

  if (keyPoints.length === 0) {
    sections.forEach((section) => {
      const lines = section.split("\n");
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        const isBullet = trimmedLine.startsWith("•") || /^[-*]\s+/.test(trimmedLine);
        if (isBullet && keyPoints.length < 20) {
          const cleanPoint = trimmedLine
            .replace(/^•\s*/, "")
            .replace(/^[-*]\s+/, "")
            .trim();
          if (cleanPoint && cleanPoint.length > 10) {
            keyPoints.push(cleanPoint);
          }
        }
      });
    });
  }

  if (keyPoints.length === 0 && sections.length > 1) {
    for (let i = 1; i < sections.length && keyPoints.length < 20; i++) {
      const lines = sections[i]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && !line.startsWith("•"));

      if (lines.length === 0) continue;

      const candidate = lines[0];
      if (candidate.length > 40) {
        keyPoints.push(candidate);
      }
    }
  }

  return {
    title: docTitle,
    executiveSummary,
    keyPoints,
    documentType,
  };
};
