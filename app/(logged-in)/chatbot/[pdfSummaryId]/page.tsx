import { Suspense } from "react";
import ChatbotClient from "@/components/chatbot/chatbot-client";
import { findSummaryById } from "@/lib/summaries";
import { getPdfStoreBySummaryId } from "@/lib/chatbot";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { MessageCircle, Bot, ArrowLeft } from "lucide-react";
import BgGradient from "@/components/common/bg-gradient";
import { Button } from "@/components/ui/button";
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
    <div className="fixed inset-0 flex flex-col bg-background">
      <BgGradient className="from-black via-gray-900 to-black" />

      {/* Fixed Header - Always Visible */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 bg-black/50 backdrop-blur-sm border-b border-gray-800 z-30 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
          <Link 
            href="/dashboard" 
            className="group flex items-center px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-orange-500 border border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 rounded-md sm:rounded-lg lg:rounded-xl font-medium text-xs sm:text-sm lg:text-base h-6 sm:h-7 lg:h-10 flex-shrink-0"
          >
            <ArrowLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="ml-1 sm:ml-2">Go Back</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-1 justify-center min-w-0">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-orange-500 flex-shrink-0" />
            <h1 className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent truncate">
              Chat with Your Document
            </h1>
          </div>
          <div className="w-0 sm:w-10 lg:w-24 flex-shrink-0"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full">
          {pdfStore ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-orange-500"></div>
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
            <div className="flex items-center justify-center h-full">
              <div className="relative p-4 sm:p-6 bg-card/80 backdrop-blur-md rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-border max-w-2xl transition-all duration-300 hover:shadow-2xl hover:bg-card/90">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent opacity-50 rounded-xl sm:rounded-2xl lg:rounded-3xl" />

                <div className="relative">
                  <CardContent className="flex flex-col items-center justify-center py-8 lg:py-12">
                    <MessageCircle className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-3 lg:mb-4" />
                    <h3 className="text-base lg:text-lg font-semibold mb-2 text-center">
                      Chatbot Not Available
                    </h3>
                    <p className="text-gray-600 text-center mb-4 text-sm lg:text-base px-4">
                      The chatbot functionality is not yet initialized for this
                      document. This usually happens when PDF text extraction failed during upload.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1 mb-4">
                      <p>Document ID: {pdfSummaryId}</p>
                      <p>Title: {summary?.title || "Unknown"}</p>
                    </div>
                  </CardContent>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
