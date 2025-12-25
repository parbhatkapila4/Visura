import { Suspense } from "react";
import ChatbotClient from "@/components/chatbot/chatbot-client";
import { findSummaryById } from "@/lib/summaries";
import { getPdfStoreBySummaryId } from "@/lib/chatbot";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessageCircle, ChevronLeft, FileText } from "lucide-react";
import Link from "next/link";

interface ChatbotPageProps {
  params: {
    pdfSummaryId: string;
  };
}

async function ChatbotPage({ params }: ChatbotPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { pdfSummaryId } = params;

  const summary = await findSummaryById(pdfSummaryId);
  if (!summary || summary.user_id !== userId) {
    redirect("/dashboard");
  }

  const pdfStore = await getPdfStoreBySummaryId(pdfSummaryId, userId);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a]">
      <header className="h-14 flex-shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
        <div className="h-full px-4 flex items-center">
          <Link
            href={`/summaries/${pdfSummaryId}`}
            className="flex items-center gap-2 text-[#666] hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="flex-1 flex items-center justify-center lg:pl-52">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-[#2a2a2a]">
                <FileText className="w-3.5 h-3.5 text-[#666]" />
                <span className="text-sm text-[#888] max-w-[200px] truncate">
                  {summary.title || "Document"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-medium">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {pdfStore ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce" />
                </div>
              </div>
            }
          >
            <ChatbotClient
              pdfSummaryId={pdfSummaryId}
              pdfStoreId={pdfStore.id}
              pdfTitle={summary.title || summary.file_name}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <div className="max-w-md text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Chat Not Available</h3>
              <p className="text-[#666] mb-8 leading-relaxed">
                The chatbot functionality is not yet initialized for this document. This usually
                happens when text extraction failed during upload, or the document doesn't contain extractable text content.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center h-11 px-6 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e5e5e5] transition-colors"
                >
                  Upload New Document
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-11 px-6 bg-white/5 text-white text-sm font-medium rounded-lg border border-[#2a2a2a] hover:bg-white/10 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatbotPage;
