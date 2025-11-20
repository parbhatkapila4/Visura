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
      const response = await fetch(
        `/api/downloads/check?summaryId=${summaryId}`
      );
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

  const generatePDF = (text: string, docTitle: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(docTitle || "Summary", maxWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 8 + 5;

    // Add a line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Process the summary text - split by sections (markdown headers)
    const sections = text.split(/\n(?=##?\s+)/);

    sections.forEach((section, sectionIndex) => {
      // Check if we need a new page
      if (yPos > pageHeight - margin - 20) {
        doc.addPage();
        yPos = margin;
      }

      const lines = section.split("\n").filter((line) => line.trim());
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) return;

        // Check if we need a new page
        if (yPos > pageHeight - margin - 15) {
          doc.addPage();
          yPos = margin;
        }

        // Check if it's a header (starts with #)
        if (trimmedLine.startsWith("#")) {
          const headerLevel = trimmedLine.match(/^#+/)?.[0].length || 1;
          const headerText = trimmedLine.replace(/^#+\s+/, "").trim();
          
          if (headerLevel === 1) {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
          } else if (headerLevel === 2) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
          } else {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
          }

          yPos += 5;
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, yPos);
          yPos += headerLines.length * (headerLevel === 1 ? 8 : headerLevel === 2 ? 7 : 6);
        } else {
          // Regular text
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          
          // Check if it's a bullet point or numbered list
          const isListItem = /^[-•*]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine);
          const textContent = trimmedLine.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, "");
          
          if (isListItem) {
            const bulletText = "• " + textContent;
            const textLines = doc.splitTextToSize(bulletText, maxWidth - 5);
            doc.text(textLines, margin + 5, yPos);
            yPos += textLines.length * 5;
          } else {
            const textLines = doc.splitTextToSize(textContent, maxWidth);
            doc.text(textLines, margin, yPos);
            yPos += textLines.length * 5;
          }
        }
        
        yPos += 2;
      });

      // Add spacing between sections
      if (sectionIndex < sections.length - 1) {
        yPos += 3;
      }
    });

    return doc;
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      // Check download status first
      const status = await checkDownloadStatus();
      
      if (!status) {
        setIsDownloading(false);
        return;
      }

      // Check if user can download
      if (!status.canDownload) {
        toast.error(
          `Download limit reached. You have downloaded ${status.downloadCount} out of ${status.downloadLimit} summaries. Upgrade to Pro for unlimited downloads.`
        );
        setIsDownloading(false);
        return;
      }

      // Generate PDF
      const doc = generatePDF(summaryText, title || "Summary");
      
      // Record the download
      const recordResponse = await fetch("/api/downloads/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summaryId }),
      });

      if (!recordResponse.ok) {
        console.error("Failed to record download");
        // Continue with download anyway
      }

      // Save PDF with proper filename
      const fileName = `${(title || "Summary").replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
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
      className={`relative h-7 sm:h-8 md:h-8 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all duration-300 overflow-hidden ${
        isPro
          ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 hover:from-blue-400 hover:via-blue-500 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] border border-blue-400/20"
          : "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 hover:from-gray-500 hover:via-gray-600 hover:to-gray-500 text-white shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/30 hover:scale-[1.02] border border-gray-500/20"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleDownload}
      disabled={isDisabled}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></span>
      <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 relative z-10" />
      <span className="relative z-10">
        {isDownloading ? "Downloading..." : "Download"}
      </span>
    </Button>
  );
}

