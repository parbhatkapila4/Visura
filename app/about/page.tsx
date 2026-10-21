"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            About us
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-3xl">
            Visura summarizes the documents you upload and answers questions about them. Upload a
            changed file under the same name and it becomes a new version: passages that match an
            earlier version keep their summaries, and the rest are summarized.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12 lg:mb-16">
            Our principles
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div className="space-y-8 sm:space-y-12">
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Reuse summaries for matching passages
                </h3>
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                  When you upload a new version, Visura splits it into passages and compares each
                  one with earlier versions of the same document. Passages that match keep their
                  existing summaries. Matching sets aside line breaks, extra spaces, quote and dash
                  styles, running headers and footers, short lines that repeat, and any line that
                  reads like a page number, including a line of nothing but digits. The rest are
                  summarized again.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Show where answers come from
                </h3>
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                  For longer documents, chat answers from the passages most related to your question
                  and lists them under the answer, with a page number when Visura knows it.
                </p>
              </div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Flag a cut-off or OCR read
                </h3>
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                  If Visura reads only the first 50 pages of a PDF, or reads a scan with OCR, that
                  version's processing page says so, and its overview leaves out the reuse counts.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  State the limits plainly
                </h3>
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                  The upload form accepts files up to 32 MB. In your browser, PDFs are read up to
                  the first 50 pages, and fully scanned PDFs up to 10 pages with English OCR. Older
                  .doc and .ppt files are not supported. Summaries are written in English.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-3xl">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                About Visura
              </h2>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
                <p>
                  Visura reads PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx and .xls), text
                  and Markdown files. Each upload gets a summary and a chat, plus pages for its
                  sections, key insights and a graph of topics and entities, each drawn from the
                  start of the document. You can share a read-only link to a summary or add the
                  document to a workspace.
                </p>
                <p>
                  Summaries, chat, sections, insights and the graph are written by GPT-4o mini.
                  Every model call goes through OpenRouter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
