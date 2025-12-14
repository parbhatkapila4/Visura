import BgGradient from "@/components/common/bg-gradient";
import SummaryViewer from "@/components/summaries/summary-viewer";
import { findSummaryByShareToken } from "@/lib/summaries";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const token = params.token;
  const summary = await findSummaryByShareToken(token);

  if (!summary) {
    return {
      title: "Summary Not Found - Visura",
    };
  }

  return {
    title: `${summary.title || "Shared Summary"} - Visura`,
    description: summary.summary_text.substring(0, 160) + "...",
  };
}

export default async function SharePage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const token = params.token;

  const summary = await findSummaryByShareToken(token);

  if (!summary) {
    return (
      <div className="relative isolate min-h-screen bg-background">
        <BgGradient className="bg-black" />

        <div className="container mx-auto flex flex-col gap-4">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
                    <svg
                      className="w-10 h-10 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Share Link Revoked
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-400 mb-2">
                    This share link is no longer accessible.
                  </p>
                  <p className="text-sm sm:text-base text-gray-500">
                    The administrator has revoked access to this shared summary. The link will no
                    longer work.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-400">
                      If you need access, please contact the document owner.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { title, summary_text, word_count } = summary;

  const isErrorSummary =
    summary_text.toLowerCase().includes("extraction error") ||
    summary_text.toLowerCase().includes("object.defineproperty") ||
    summary_text.toLowerCase().includes("was unable to access") ||
    summary_text.toLowerCase().includes("i apologize");

  const reading_time = isErrorSummary ? 1 : Math.ceil((word_count || 0) / 200);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <BgGradient className="bg-black" />

      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                {title || "Shared Summary"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Created: {new Date(summary.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{reading_time} min read</span>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                This is a shared summary from Visura AI
              </div>
            </div>
          </div>

          <div>
            <div className="relative mt-4 sm:mt-8 lg:mt-16">
              <SummaryViewer summary={summary_text} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
