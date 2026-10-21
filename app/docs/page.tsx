"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Documentation</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            How to upload documents to Visura, read their summaries, chat with them and share them.
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 space-y-16 lg:space-y-20 pt-12">
        <section className="space-y-8 lg:space-y-10">
          <div className="max-w-4xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">What is Visura?</h2>
            <p className="text-zinc-400 text-base lg:text-lg leading-relaxed">
              Visura summarizes documents and answers questions about them. You upload PDFs and
              other documents, and Visura turns them into summaries, section outlines and insights,
              with a chat for each document. Instead of scanning pages yourself, you ask questions
              and get answers based on the document&apos;s text, and every document you upload stays
              in your account until you delete it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Who is it for?</h3>
              <p className="text-zinc-400 text-sm lg:text-base leading-relaxed">
                Product teams, founders, analysts, students, and anyone who works with dense PDFs:
                reports, research papers, legal docs, contracts, specs, and more. If you regularly
                need to “read and understand” documents, Visura is built for you.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Why does it exist?</h3>
              <p className="text-zinc-400 text-sm lg:text-base leading-relaxed">
                Most knowledge is trapped in static files. Manually reading and summarizing them is
                slow, error‑prone, and doesn&apos;t scale. Visura exists to give you a single place
                where documents become interactive: you can search, summarize, compare, and ask
                questions about them.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">How does it feel to use?</h3>
              <p className="text-zinc-400 text-sm lg:text-base leading-relaxed">
                You drag‑and‑drop a file, wait while it processes, and get a summary, insights and a
                chat for that document. From there you can keep everything organized in your
                dashboard and workspaces.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6 lg:space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">How Visura works</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
              <p className="text-xs font-semibold text-zinc-500 tracking-[0.18em] uppercase mb-2">
                1 · Upload
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">Add your documents</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Upload a PDF, DOCX, TXT, MD, XLSX, XLS or PPTX file of up to 32 MB from the Upload
                page. Visura extracts the text and stores the original file with the document.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
              <p className="text-xs font-semibold text-zinc-500 tracking-[0.18em] uppercase mb-2">
                2 · Analyze
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">AI understanding</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Visura splits the text into passages, summarizes them with a language model and
                merges the results into one summary. It also builds a section outline, a list of
                insights and a graph of topics and entities, each from the start of the document.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
              <p className="text-xs font-semibold text-zinc-500 tracking-[0.18em] uppercase mb-2">
                3 · Explore
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">Dashboard & summaries</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                On the dashboard you can browse and search your summaries, download a summary as a
                PDF, and delete documents. Add a document to a workspace from its summary page.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
              <p className="text-xs font-semibold text-zinc-500 tracking-[0.18em] uppercase mb-2">
                4 · Chat
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">
                Ask questions in plain English
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Each document has its own chat. Ask questions and follow‑ups; answers are based on
                the document&apos;s text, and for long documents on the passages most relevant to
                your question.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Data, privacy & security</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Document handling</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Visura sends your document&apos;s text to AI models through OpenRouter to produce
                its summaries, insights and chat answers. We do not sell your data or use your
                documents for training generic models.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Security basics</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                All traffic is encrypted in transit via HTTPS. A summary opens only for you and for
                anyone who has its share link. Chat with a document is open only to you.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Ownership</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                You retain full ownership of your documents and generated summaries. Deleting a
                document from the dashboard removes its summary, its chat history and its share
                link, and takes it out of any workspace. The uploaded file, its versions and
                everything built from them (passages and their summaries, section outlines,
                insights, graphs and search data) are kept.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Common questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                How accurate are the summaries?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Passages are summarized by a large language model, and the passage summaries are
                merged into one summary, written in English. For critical work (legal, medical,
                financial), you should still review the original document.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                What file types work best?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Text‑based PDFs give the best results. Your browser reads the first 50 pages of a
                PDF (if it can&apos;t read the file, the server reads the whole file), and a fully
                scanned PDF is read with English OCR, up to 10 pages. Older .doc and .ppt files are
                not supported; save them as .docx or .pptx first.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                How do I share a summary?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Use Share on its summary page to create a link anyone can open without signing in.
                Chat with a document stays private to you.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                How do I get help or request features?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Email us at{" "}
                <a
                  href="mailto:parbhat@parbhat.dev"
                  className="text-primary font-medium underline underline-offset-2 hover:text-primary/90"
                >
                  parbhat@parbhat.dev
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Where to find things in Visura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm lg:text-base">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="font-semibold text-white mb-2">Dashboard</h3>
              <p className="text-zinc-400 leading-relaxed">
                The /dashboard page shows the documents you&apos;ve uploaded, quick stats, and entry
                points into summaries and chat. It&apos;s the best place to get a high‑level view of
                your activity in Visura.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="font-semibold text-white mb-2">Summaries</h3>
              <p className="text-zinc-400 leading-relaxed">
                Each processed document has its own summary page. Here you&apos;ll see the main
                points, links to its sections, insights, knowledge graph and chat, and actions to
                share it or add it to a workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="font-semibold text-white mb-2">Chatbot</h3>
              <p className="text-zinc-400 leading-relaxed">
                Open Chat from a document&apos;s dashboard card or summary page to ask questions
                about that document. It reopens your most recent conversation; on narrow screens,
                New chat starts a fresh one.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="font-semibold text-white mb-2">Uploads & processing</h3>
              <p className="text-zinc-400 leading-relaxed">
                Upload at /upload; the document appears on your dashboard while it processes. Upload
                a changed copy under the same file name and it becomes a new version: unchanged
                passages keep their earlier summaries and only changed ones are summarized again.
                Differences in spacing, quote style and short header or footer lines repeated across
                pages don&apos;t mark a passage as changed, and neither does a line that holds only
                a whole number or a page label, such as &quot;12&quot; or &quot;Page 4 of 90&quot;.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="font-semibold text-white mb-2">Workspaces</h3>
              <p className="text-zinc-400 leading-relaxed">
                Workspaces at /workspaces group documents you add from their summary pages. Inside
                one you can search those documents and run Analyze workspace to compare them.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <h3 className="font-semibold text-white mb-2">Limits</h3>
              <p className="text-zinc-400 leading-relaxed">
                Free accounts keep up to 5 documents, Starter 10 and Pro 1,000, and each new version
                counts as one. Every account can download 2 summaries; downloading one again
                doesn&apos;t count. Document chat takes up to 10 messages a minute, and new
                processing has a daily cap per account that reused passages don&apos;t count toward.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
