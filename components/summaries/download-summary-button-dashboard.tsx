"use client";

import { Button } from "@/components/ui/button";
import { Download, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export default function DownloadSummaryButtonDashboard({
  summaryId,
  title,
  summaryText,
  userPlan,
}: {
  summaryId: string;
  title: string | null;
  summaryText: string;
  userPlan: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<{
    canDownload: boolean;
    downloadCount: number;
    downloadLimit: number | null;
    hasDownloaded: boolean;
  } | null>(null);

  const checkDownloadStatus = async () => {
    try {
      const response = await fetch(`/api/downloads/check?summaryId=${summaryId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check download status");
      }

      setDownloadStatus({
        canDownload: data.canDownload,
        downloadCount: data.downloadCount,
        downloadLimit: data.downloadLimit,
        hasDownloaded: data.hasDownloaded,
      });

      return data;
    } catch (error) {
      console.error("Error checking download status:", error);
      toast.error("Failed to check download status");
      return null;
    }
  };

  const cleanMarkdown = (text: string): string => {
    let cleaned = text;

    cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
    cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

    cleaned = cleaned.replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu,
      ""
    );

    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    cleaned = cleaned.replace(/ {2,}/g, " ");

    return cleaned.trim();
  };

  const renderTextWithBold = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts: Array<{ text: string; bold: boolean }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText.trim()) {
          parts.push({ text: beforeText, bold: false });
        }
      }

      parts.push({ text: match[1], bold: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push({ text: remainingText, bold: false });
      }
    }

    if (parts.length === 0) {
      parts.push({ text: text.replace(/\*\*/g, ""), bold: false });
    }

    let currentX = x;
    let currentY = y;
    const lineHeight = fontSize * 0.5;

    parts.forEach((part) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", part.bold ? "bold" : "normal");

      const words = part.text.trim().split(/\s+/);

      words.forEach((word) => {
        const spaceWidth = doc.getTextWidth(" ");
        const wordWidth = doc.getTextWidth(word);

        if (currentX + wordWidth > x + maxWidth && currentX > x) {
          currentY += lineHeight;
          currentX = x;
        }

        if (currentX > x) {
          doc.text(" ", currentX, currentY);
          currentX += spaceWidth;
        }

        if (currentX + wordWidth > x + maxWidth && currentX > x) {
          currentY += lineHeight;
          currentX = x;
        }

        doc.text(word, currentX, currentY);
        currentX += wordWidth;
      });
    });

    return { x: currentX, y: currentY + lineHeight, height: lineHeight };
  };

  const generatePDF = (text: string, docTitle: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    const cleanTitle = docTitle || "Summary";

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(cleanTitle, maxWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 10 + 8;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    let cleanText = cleanMarkdown(text);

    const sections = cleanText.split(/\n(?=##\s+)/);

    if (sections.length === 1) {
      sections.splice(0, sections.length, ...cleanText.split(/\n(?=#\s+)/));
    }

    sections.forEach((section, sectionIndex) => {
      if (yPos > pageHeight - margin - 25) {
        doc.addPage();
        yPos = margin;
      }

      const lines = section.split("\n").filter((line) => line.trim());
      let currentSectionTitle = "";

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          yPos += 2;
          return;
        }

        if (yPos > pageHeight - margin - 20) {
          doc.addPage();
          yPos = margin;
        }

        if (trimmedLine.startsWith("#")) {
          const headerLevel = trimmedLine.match(/^#+/)?.[0].length || 1;
          let headerText = trimmedLine.replace(/^#+\s+/, "").trim();

          headerText = headerText.replace(/\*\*/g, "").replace(/`/g, "").trim();

          if (currentSectionTitle || sectionIndex > 0 || headerLevel === 2) {
            yPos += headerLevel === 1 ? 8 : 6;
          }

          currentSectionTitle = headerText;

          doc.setFontSize(headerLevel === 1 ? 16 : headerLevel === 2 ? 14 : 12);
          doc.setFont("helvetica", "bold");
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, yPos);
          yPos += headerLines.length * (headerLevel === 1 ? 9 : headerLevel === 2 ? 7 : 6);
        } else {
          const isListItem = /^[-•*]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine);
          let textContent = trimmedLine;

          if (isListItem) {
            textContent = trimmedLine.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, "");
          }

          textContent = textContent.replace(/[*_`]/g, "").trim();

          if (!textContent) return;

          doc.setFontSize(10);
          const lineHeight = 5.5;
          const lineSpacing = 1;

          let processedContent = textContent
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
            .replace(/\*(?![*])/g, "")
            .trim();

          if (!processedContent) {
            yPos += lineHeight;
            return;
          }

          const textStartX = margin + (isListItem ? 7 : 0);
          const textMaxWidth = maxWidth - (isListItem ? 7 : 0);

          if (isListItem) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("•", margin, yPos);
          }

          if (processedContent.includes("**")) {
            const result = renderTextWithBold(
              doc,
              processedContent,
              textStartX,
              yPos,
              textMaxWidth,
              10
            );
            yPos = result.y + result.height + lineSpacing;
          } else {
            processedContent = processedContent.replace(/[*_`]/g, "").trim();
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const textLines = doc.splitTextToSize(processedContent, textMaxWidth);
            doc.text(textLines, textStartX, yPos);
            yPos += textLines.length * lineHeight + lineSpacing;
          }
        }
      });

      if (sectionIndex < sections.length - 1) {
        yPos += 4;
      }
    });

    return doc;
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const recordResponse = await fetch("/api/downloads/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summaryId }),
      });

      const recordData = await recordResponse.json();

      if (!recordResponse.ok || !recordData.success) {
        const errorMessage = recordData.message || recordData.error || "Download limit reached";
        toast.error(errorMessage);
        setIsDownloading(false);
        return;
      }

      const doc = generatePDF(summaryText, title || "Summary");

      const fileName = `${(title || "Summary").replace(/[^a-z0-9]/gi, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);

      toast.success("Summary downloaded successfully!");
    } catch (error) {
      console.error("Error downloading summary:", error);
      toast.error("Failed to download summary. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isPro = userPlan === "pro";
  const isDisabled = isDownloading;

  return (
    <Button
      size="sm"
      className={`group relative h-7 sm:h-8 md:h-8 w-7 sm:w-8 md:w-8 p-0 flex items-center justify-center rounded-lg transition-all duration-300 overflow-hidden ${
        isPro
          ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 hover:from-blue-400 hover:via-blue-500 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.05] border border-blue-400/20"
          : "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 hover:from-gray-500 hover:via-gray-600 hover:to-gray-500 text-white shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/30 hover:scale-[1.05] border border-gray-500/20"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleDownload}
      disabled={isDisabled}
      title={isDownloading ? "Downloading..." : "Download PDF"}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
      {isDownloading ? (
        <div className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:scale-110 transition-transform" />
      )}
    </Button>
  );
}
