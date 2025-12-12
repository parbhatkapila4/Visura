import { findSummaryById } from "@/lib/summaries";
import { notFound } from "next/navigation";
import PremiumSummaryView from "@/components/summaries/premium-summary-view";

export default async function SummaryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;

  const summary = await findSummaryById(id);

  if (!summary) {
    notFound();
  }

  return (
    <PremiumSummaryView 
      summary={{
        id: summary.id,
        title: summary.title || "Untitled Document",
        summary_text: summary.summary_text,
        created_at: summary.created_at,
        word_count: summary.word_count,
      }} 
    />
  );
}
