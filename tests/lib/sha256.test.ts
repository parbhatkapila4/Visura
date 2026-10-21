import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { sha256Hex } from "@/lib/sha256";

const node = (s: string) => createHash("sha256").update(s).digest("hex");

describe("sha256Hex", () => {
  it("matches the published vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("matches node's crypto on text that looks like a document", () => {
    const samples = [
      "The aggregate liability shall not exceed $5,000,000 in any event.",
      "1. CLAUSE 1 This clause sets out the obligations of the parties.",
      "a".repeat(55),
      "a".repeat(56), 
      "a".repeat(57),
      "a".repeat(63),
      "a".repeat(64),
      "a".repeat(65),
      "a".repeat(4096),
    ];
    for (const s of samples) expect(sha256Hex(s)).toBe(node(s));
  });

  it("matches node's crypto on multi-byte characters", () => {
    for (const s of [
      "₹1,770 · €17 · $20",
      "naïve café — résumé",
      "日本語のテキスト",
      "🕊 origami",
    ]) {
      expect(sha256Hex(s)).toBe(node(s));
    }
  });

  it("is stable across calls", () => {
    const s = "the same input twice";
    expect(sha256Hex(s)).toBe(sha256Hex(s));
  });
});
