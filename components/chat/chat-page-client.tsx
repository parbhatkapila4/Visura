"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, FileText } from "lucide-react";
import { SidebarWithContent } from "@/components/sidebar-component";

interface Summary {
  id: string;
  title: string | null;
  summary_text: string;
  original_file_url: string | null;
  created_at: string;
  status?: string;
}

export default function ChatPageClient({ summaries }: { summaries: Summary[] }) {
  return (
    <SidebarWithContent>
      <div className="min-h-screen w-full flex flex-col">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 w-full">
          <h1 className="text-2xl font-semibold text-white mb-2">Chat with Doc.</h1>
          <p className="text-[#666] text-sm mb-8">
            Select a document to open the AI chat and ask questions.
          </p>

          {summaries.length === 0 ? (
            <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#555]" />
              </div>
              <h2 className="text-lg font-medium text-white mb-2">No documents yet</h2>
              <p className="text-[#666] text-sm mb-6 max-w-sm mx-auto">
                Upload a document from the dashboard to start chatting with it.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summaries.map((summary) => (
                <Link
                  key={summary.id}
                  href={`/chatbot/${summary.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[#111] border border-[#1f1f1f] hover:border-[#333] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#666] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-white">
                      {summary.title || "Untitled Document"}
                    </p>
                    <p className="text-xs text-[#555]">
                      {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-[#555] group-hover:text-white shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarWithContent>
  );
}
