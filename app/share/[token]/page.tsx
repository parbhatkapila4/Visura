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
      title: "Summary not found - Visura",
    };
  }

  return {
    title: `${summary.title || "Shared summary"} - Visura`,
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
                    Share link not found
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-400 mb-2">
                    No summary is shared at this link.
                  </p>
                  <p className="text-sm sm:text-base text-gray-500">
                    The owner may have deleted the summary, or the link may be incomplete.
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
                      Ask the person who shared it for a new link.
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

  const { title, summary_text } = summary;

  return (
    <div className="relative isolate min-h-screen bg-background">
      <BgGradient className="bg-black" />

      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                {title || "Shared summary"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Created: {new Date(summary.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-4 text-sm text-gray-500">Shared from Visura</div>
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
