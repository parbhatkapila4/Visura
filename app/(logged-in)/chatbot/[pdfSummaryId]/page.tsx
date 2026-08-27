import { Suspense } from "react";
import { ChatbotAnimatedView } from "@/components/chatbot/chatbot-animated-view";
import { findSummaryById } from "@/lib/summaries";
import { getPdfStoreBySummaryId } from "@/lib/chatbot";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessageCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import InitializeChatbotButton from "./initialize-chatbot-button";
import ChatbotPortal from "./chatbot-portal";
import MobileNewChatButton from "./mobile-new-chat-button";

interface ChatbotPageProps {
  params: Promise<{
    pdfSummaryId: string;
  }>;
}

async function ChatbotPage({ params }: ChatbotPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { pdfSummaryId } = await params;

  const summary = await findSummaryById(pdfSummaryId);
  if (!summary || summary.user_id !== userId) {
    redirect("/dashboard");
  }

  const pdfStore = await getPdfStoreBySummaryId(pdfSummaryId, userId);

  console.log("ChatbotPage render:", {
    pdfSummaryId,
    hasPdfStore: !!pdfStore,
    pdfStoreId: pdfStore?.id,
  });

  return (
    <ChatbotPortal>
      <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-slate-100">
        <header className="h-14 flex-shrink-0 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm flex items-center">
          <div className="h-full px-4 flex items-center justify-between w-full">
            <Link
              href="/chatbot"
              className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back</span>
            </Link>

            <MobileNewChatButton />
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {pdfStore ? (
            <div className="h-full w-full">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full w-full bg-slate-950">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce" />
                    </div>
                  </div>
                }
              >
                <ChatbotAnimatedView
                  pdfSummaryId={pdfSummaryId}
                  pdfStoreId={pdfStore.id}
                  pdfTitle={summary.title || summary.file_name}
                />
              </Suspense>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full p-6 bg-slate-950 text-slate-100">
              <div className="max-w-md text-center w-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Chat Not Available</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  The chatbot functionality is not yet initialized for this document. Click the
                  button below to initialize it.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <InitializeChatbotButton pdfSummaryId={pdfSummaryId} />
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center h-11 px-6 bg-slate-900 text-slate-100 text-sm font-medium rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatbotPortal>
  );
}

export default ChatbotPage;
