"use client";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Sparkles,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export default function SummaryHeader({
  title,
  createdAt,
  readingTime,
  summaryId,
}: {
  title: string;
  createdAt: string;
  readingTime?: number;
  summaryId?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/10 rounded-2xl -m-4 p-4"></div>

      <div className="relative z-10">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 -mt-8">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="group flex items-center gap-3 hover:bg-orange-500/10 backdrop-blur-sm rounded-xl transition-all duration-300 bg-orange-500/5 hover:scale-105 px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[160px] sm:min-w-[180px]"
              >
                <div className="p-1 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors duration-200">
                  <ChevronLeft className="h-4 w-4 text-white transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="font-semibold text-white text-sm sm:text-base">
                  Back to Dashboard
                </span>
              </Button>
            </Link>

            {summaryId && (
              <Link href={`/chatbot/${summaryId}`} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[160px] sm:min-w-[180px]"
                >
                  <div className="p-1 rounded-lg bg-white/20">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">
                    Chat with Document
                  </span>
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-3 w-full flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-2xl blur-sm opacity-100 animate-pulse"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/40 via-amber-500/20 to-orange-500/40 rounded-2xl blur-sm opacity-75 animate-pulse"></div>

              <div className="relative bg-black/80 backdrop-blur-sm rounded-2xl border border-orange-500/40 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 border border-orange-500/30">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-white via-orange-400 to-amber-400 bg-clip-text text-transparent">
                      {title}
                    </span>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 sm:hidden">
              <div className="p-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <Calendar className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="font-medium text-sm">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <Badge
              variant="secondary"
              className="relative px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-orange-500/20 to-amber-500/10 backdrop-blur-sm rounded-full border border-orange-500/30 hover:from-orange-500/30 hover:to-amber-500/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-sm"></div>
                </div>
                <span className="text-white font-semibold">AI Summary</span>
              </div>
            </Badge>

            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
              <div className="p-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="font-medium text-sm">
                {readingTime} min read
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
              <div className="p-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <Calendar className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="font-medium text-sm">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent w-full max-w-2xl mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
