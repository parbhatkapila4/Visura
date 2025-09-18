import { Suspense } from "react";
import ChatbotClient from "@/components/chatbot/chatbot-client";
import { getSummaryById } from "@/lib/summaries";
import { getPdfStoreBySummaryId } from "@/lib/chatbot";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { MessageCircle, Bot } from "lucide-react";
import BgGradient from "@/components/common/bg-gradient";

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

  // Get PDF summary details
  const summary = await getSummaryById(pdfSummaryId);
  if (!summary || summary.user_id !== userId) {
    redirect("/dashboard");
  }

  // Check if chatbot is initialized
  const pdfStore = await getPdfStoreBySummaryId(pdfSummaryId, userId);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <BgGradient className="from-[#484593] via-[#484593]/80 to-[#484593]/60" />

      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="h-8 w-8 text-[#484593]" />
              <h1 className="text-3xl font-bold">Chat with Your Document</h1>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-8 lg:mt-16">
            {pdfStore ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#484593]"></div>
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
              <div className="relative p-4 sm:p-6 bg-card/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-border w-full transition-all duration-300 hover:shadow-2xl hover:bg-card/90">
                <div className="absolute inset-0 bg-gradient-to-br from-[#484593]/10 via-[#484593]/5 to-transparent opacity-50 rounded-2xl sm:rounded-3xl" />

                <div className="relative">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Chatbot Not Available
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      The chatbot functionality is not yet initialized for this
                      document. Please try uploading the document again or
                      contact support.
                    </p>
                  </CardContent>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
