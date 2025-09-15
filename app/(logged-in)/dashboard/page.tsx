import BgGradient from "@/components/common/bg-gradient";
import SummaryCard from "@/components/summaries/summary-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const uploadLimit = 5;

  return (
    <main className="min-h-screen">
      <BgGradient className="from-emerald-200 via-teal-200 to-cyan-200" />
      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-2 py-12 sm:py-12">
          <div className="flex gap-4 mb-8 justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-gray-600 to-gray-900 text-transparent bg-clip-text">
                Your Summaries
              </h1>
              <p className="text-gray-600">
                Transform your PDFs into concise summaries with AI
              </p>
            </div>
            <Button
              variant={"link"}
              className="bg-linear-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 hover:scale-105 transition-all duration-300 group hover:no-underline"
            >
              <Link href="/upload" className="flex items-center text-white">
                <Plus className="w-5 h-5 mr-2" />
                New Summary
              </Link>
            </Button>
          </div>
          <div className="mb-6">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-800">
              <p className="text-sm">
                You have reached the limit of your{" "}
                <span className="font-bold text-black">Basic</span> plan. Please
                upgrade to a <span className="font-bold text-black">Pro</span>{" "}
                plan to continue using the service.
                <Link
                  href="/#pricing"
                  className="text-black font-bold pl-1 inline-flex items-center gap-1 underline underline-offset-2"
                >
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-0">
            {[...Array(uploadLimit)].map((_, index) => (
              <SummaryCard key={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
