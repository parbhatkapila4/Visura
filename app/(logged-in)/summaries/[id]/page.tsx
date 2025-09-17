import BgGradient from "@/components/common/bg-gradient";
import SourceInfo from "@/components/summaries/source-info";
import SummaryHeader from "@/components/summaries/summary-header";
import { getSummaryById } from "@/lib/summaries";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import SummaryViewer from "@/components/summaries/summary-viewer";

export default async function SummaryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;

  const summary = await getSummaryById(id);

  if (!summary) {
    notFound();
  }

  const {
    title,
    summary_text,
    file_name,
    word_count,
    created_at,
    original_file_url,
  } = summary;

  const reading_time = Math.ceil((word_count || 0) / 200);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <BgGradient className="from-green-500 via-green-300 to-green-200" />

      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
          <div className="flex flex-col">
            <SummaryHeader
              title={title}
              createdAt={summary.created_at}
              readingTime={reading_time}
              summaryId={summary.id}
            />
          </div>

          <div>
            {file_name && (
              <SourceInfo
                title={title}
                summaryText={summary_text}
                fileName={file_name}
                createdAt={created_at}
                originalFileUrl={original_file_url}
                summaryId={summary.id}
              />
            )}

            <div className="relative mt-4 sm:mt-8 lg:mt-16">
              <div className="relative p-4 sm:p-6 lg:p-8 bg-card/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-border w-min transition-all duration-300 hover:shadow-2xl hover:bg-card/90  mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-green-900/5 to-transparent opacity-50 rounded-2xl sm:rounded-3xl" />
               
                <div className="relative mt-8 sm:mt-6 flex justify-center">
                  <SummaryViewer summary={summary_text} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
