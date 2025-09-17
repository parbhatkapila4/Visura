import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export default function EmptySummaryState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">
        No summaries yet
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Upload your first PDF to get started with AI-powered summaries and insights
      </p>
      <Link href="/upload">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Upload PDF
        </Button>
      </Link>
    </div>
  );
}
