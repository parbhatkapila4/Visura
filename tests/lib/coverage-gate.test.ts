import { describe, it, expect } from "vitest";
import { coverageCaveats } from "@/lib/versioned-documents";

describe("coverageCaveats", () => {
  it("says nothing when the text can be vouched for", () => {
    expect(
      coverageCaveats({ ocr_used: false, truncated: false, total_pages: 12, pages_read: 12 })
    ).toEqual([]);
  });

  it("treats missing flags as sound, since that is what the defaults record", () => {
    expect(coverageCaveats({})).toEqual([]);
    expect(coverageCaveats({ ocr_used: null, truncated: null })).toEqual([]);
  });

  it("withholds when OCR was used, and says why", () => {
    const out = coverageCaveats({ ocr_used: true, truncated: false });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatch(/not repeatable/i);
  });

  it("withholds when the document was only partly read, naming the pages", () => {
    const out = coverageCaveats({ truncated: true, total_pages: 90, pages_read: 50 });
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("90");
    expect(out[0]).toContain("50");
  });

  it("still withholds on truncation when the page counts are unknown", () => {
    const out = coverageCaveats({ truncated: true, total_pages: null, pages_read: null });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatch(/only partly read/i);
  });

  it("reports both reasons when both apply", () => {
    expect(
      coverageCaveats({ ocr_used: true, truncated: true, total_pages: 60, pages_read: 50 })
    ).toHaveLength(2);
  });
});
