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
        <header className="h-14 flex-shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center px-4">
          <h1 className="text-lg font-semibold text-white">Chat</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-white/50 text-sm mb-6">
              Choose a document to start chatting with Visura.
            </p>

            {!summaries || summaries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
                <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 font-medium mb-2">No documents yet</p>
                <p className="text-white/40 text-sm mb-6">
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
                {(summaries as { id: string; title: string | null; file_name?: string }[]).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/chatbot/${s.id}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {s.title || s.file_name || "Untitled document"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </ChatbotPortal>
  );
}
