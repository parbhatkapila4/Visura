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
  summaryText: string
): {
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
      documentType: "Unknown",
    };
  }

  const sections = summaryText
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean);

  const titleSection = sections[0] || "";
  const titleMatch = titleSection.match(/^#\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim() : "Document Summary";

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

  let documentType = "Document";
  const overviewSection = sections.find((section) => section.includes("Document Overview"));
  if (overviewSection) {
    const typeMatch = overviewSection.match(/📄\s*Type:\s*(.+)/);
    if (typeMatch) {
      documentType = typeMatch[1].trim();
    }
  }

  const keyPoints: string[] = [];

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
        if (cleanPoint && keyPoints.length < 3) {
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
        if (trimmedLine.startsWith("•") && keyPoints.length < 3) {
          const cleanPoint = trimmedLine.replace(/^•\s*/, "").trim();
          if (cleanPoint && cleanPoint.length > 10) {
            keyPoints.push(cleanPoint);
          }
        }
      });
    });
  }

  if (keyPoints.length === 0 && sections.length > 1) {
    for (let i = 1; i < sections.length && keyPoints.length < 3; i++) {
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
    title,
    executiveSummary,
    keyPoints,
    documentType,
  };
};
