import { Suspense } from "react";
import ChatbotClient from "@/components/chatbot/chatbot-client";
import { getSummaryById } from "@/lib/summaries";
import { getPdfStoreBySummaryId } from "@/lib/chatbot";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, FileText, Bot } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-8 w-8 text-rose-600" />
          <h1 className="text-3xl font-bold">Chat with Your Document</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-gray-600" />
              <CardTitle className="text-xl">{summary.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">File:</span> {summary.file_name}
              </div>
              <div>
                <span className="font-medium">Uploaded:</span>{" "}
                {new Date(summary.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Word Count:</span> {summary.word_count}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {pdfStore ? (
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ChatbotClient 
            pdfSummaryId={pdfSummaryId}
            pdfStoreId={pdfStore.id}
            pdfTitle={summary.title || summary.file_name}
          />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chatbot Not Available</h3>
            <p className="text-gray-600 text-center mb-4">
              The chatbot functionality is not yet initialized for this document. 
              Please try uploading the document again or contact support.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ChatbotPage;
