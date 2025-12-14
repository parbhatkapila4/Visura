import { describe, it, expect } from "vitest";
import { extractSummaryPreview } from "@/utils/summary-helpers";

describe("Summary Helpers", () => {
  describe("extractSummaryPreview", () => {
    it("should extract executive summary from markdown", () => {
      const summaryText = `
# Document Analysis

💡 This is the executive summary of the document. It contains key insights.

## Key Points
- Point 1
- Point 2
      `;

      const result = extractSummaryPreview(summaryText);
      expect(result.executiveSummary).toContain("executive summary");
      expect(result.keyPoints).toHaveLength(2);
    });

    it("should extract document type", () => {
      const summaryText = `
**Document Type:** Financial Report

Content here...
      `;

      const result = extractSummaryPreview(summaryText);
      expect(result.documentType).toBe("Financial Report");
    });

    it("should handle missing executive summary", () => {
      const summaryText = `
## Key Points
- Point 1
- Point 2
      `;

      const result = extractSummaryPreview(summaryText);
      expect(result.executiveSummary).toBeTruthy();
      expect(result.keyPoints).toHaveLength(2);
    });

    it("should extract key points with different bullet formats", () => {
      const summaryText = `
**Key Points:**
• Point with bullet
- Point with dash
* Point with asterisk
      `;

      const result = extractSummaryPreview(summaryText);
      expect(result.keyPoints.length).toBeGreaterThan(0);
    });

    it("should handle empty summary text", () => {
      const result = extractSummaryPreview("");
      expect(result.executiveSummary).toBeTruthy();
      expect(result.keyPoints).toEqual([]);
      expect(result.documentType).toBeTruthy();
    });

    it("should limit key points to reasonable number", () => {
      const longSummary = `
**Key Points:**
${Array.from({ length: 50 }, (_, i) => `- Point ${i + 1}`).join("\n")}
      `;

      const result = extractSummaryPreview(longSummary);
      expect(result.keyPoints.length).toBeLessThanOrEqual(20);
    });
  });
});
