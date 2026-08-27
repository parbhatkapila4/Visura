import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserSummaries } from "@/lib/summaries";
import { MessageCircle, ChevronRight, FileText } from "lucide-react";
import ChatbotPortal from "./[pdfSummaryId]/chatbot-portal";

export const dynamic = "force-dynamic";

export default async function ChatbotHomePage() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const summaries = await getUserSummaries(userId, "pro");

  return (
    <ChatbotPortal>
      <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-slate-100">
        <header className="h-14 flex-shrink-0 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm flex items-center px-4">
          <h1 className="text-lg font-semibold text-white">Chat</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-400 text-sm mb-6">
              Choose a document to start chatting with Visura.
            </p>

            {!summaries || summaries.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-12 text-center">
                <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-200 font-medium mb-2">No documents yet</p>
                <p className="text-slate-400 text-sm mb-6">
                  Upload a document from the dashboard to chat with it.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {(summaries as { id: string; title: string | null; file_name?: string }[]).map(
                  (s) => (
                    <li key={s.id}>
                      <Link
                        href={`/chatbot/${s.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/70 hover:border-slate-600 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-100 font-medium truncate">
                            {s.title || s.file_name || "Untitled document"}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </Link>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </main>
      </div>
    </ChatbotPortal>
  );
}
