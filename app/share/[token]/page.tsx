import BgGradient from "@/components/common/bg-gradient";
import SummaryViewer from "@/components/summaries/summary-viewer";
import { findSummaryByShareToken } from "@/lib/summaries";
import { notFound } from "next/navigation";
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

export default async function SharePage(props: {
  params: Promise<{ token: string }>;
}) {
  const params = await props.params;
  const token = params.token;

  const summary = await findSummaryByShareToken(token);

  if (!summary) {
    notFound();
  }

  const { title, summary_text, word_count } = summary;

  const isErrorSummary = 
    summary_text.toLowerCase().includes('extraction error') ||
    summary_text.toLowerCase().includes('object.defineproperty') ||
    summary_text.toLowerCase().includes('was unable to access') ||
    summary_text.toLowerCase().includes('i apologize');

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
                <span>
                  Created: {new Date(summary.created_at).toLocaleDateString()}
                </span>
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

