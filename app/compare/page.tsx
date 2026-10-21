import type { Metadata } from "next";
import CompareWorkbench from "@/components/compare/compare-workbench";

export const metadata: Metadata = {
  title: "Compare two versions — Visura",
  description:
    "Drop in the version you sent and the one that came back. Visura lists every change it finds and, when both files were read in full without OCR, how many passages still match once formatting, page numbers and short repeated lines such as running headers are set aside. Both files stay in your browser.",
};

export default function ComparePage() {
  return (
    <div data-vs-landing className="min-h-dvh">
      <main id="vs-main" tabIndex={-1}>
        <CompareWorkbench />
      </main>
    </div>
  );
}
