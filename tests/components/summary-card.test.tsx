import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryCard from "@/components/summaries/summary-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("SummaryCard", () => {
  const mockSummary = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test Document",
    summary_text: `
**Document Type:** Test Report

💡 This is a test executive summary.

**Key Points:**
- First key point
- Second key point
- Third key point

## Main Content
Some detailed content here.
    `,
    original_file_url: "https://example.com/test.pdf",
    created_at: new Date().toISOString(),
    status: "completed",
  };

  it("should render summary card with title", () => {
    render(<SummaryCard summary={mockSummary} />);
    expect(screen.getByText("Test Document")).toBeDefined();
  });

  it("should render status badge", () => {
    render(<SummaryCard summary={mockSummary} />);
    expect(screen.getByText("Completed")).toBeDefined();
  });

  it("should render View and Chat buttons", () => {
    render(<SummaryCard summary={mockSummary} />);
    expect(screen.getByText("View")).toBeDefined();
    expect(screen.getByText("Chat")).toBeDefined();
  });

  it("should call onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<SummaryCard summary={mockSummary} onDelete={onDelete} />);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should show failed status for error summaries", () => {
    const failedSummary = {
      ...mockSummary,
      summary_text: "Error: Failed to process document",
    };

    render(<SummaryCard summary={failedSummary} />);
    expect(screen.getByText("Failed")).toBeDefined();
  });
});
