import { Suspense } from "react";
import ChatbotClient from "@/components/chatbot/chatbot-client";
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
      <div
        className="fixed inset-0 flex flex-col bg-[#0a0a0a] text-white"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header className="h-14 flex-shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center">
          <div className="h-full px-4 flex items-center justify-between w-full">
            <Link
              href={`/summaries/${pdfSummaryId}`}
              className="flex items-center gap-2 text-[#666] hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back</span>
            </Link>

            <MobileNewChatButton />
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-[#0a0a0a]">
          {pdfStore ? (
            <div className="h-full w-full">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full w-full bg-[#0a0a0a]">
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full p-6 bg-[#0a0a0a] text-white">
              <div className="max-w-md text-center w-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Chat Not Available</h3>
                <p className="text-[#666] mb-8 leading-relaxed">
                  The chatbot functionality is not yet initialized for this document. Click the
                  button below to initialize it.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <InitializeChatbotButton pdfSummaryId={pdfSummaryId} />
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
    </ChatbotPortal>
  );
}

export default ChatbotPage;
