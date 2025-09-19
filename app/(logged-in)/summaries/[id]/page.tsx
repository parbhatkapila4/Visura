import BgGradient from "@/components/common/bg-gradient";
import SummaryHeader from "@/components/summaries/summary-header";
import { getSummaryById } from "@/lib/summaries";
import { notFound } from "next/navigation";
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

  const { title, summary_text, word_count } = summary;

  const reading_time = Math.ceil((word_count || 0) / 200);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <BgGradient className="bg-black" />

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
            <div className="relative mt-4 sm:mt-8 lg:mt-16">
              <SummaryViewer summary={summary_text} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
