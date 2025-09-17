"use client";

import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, Clock, Sparkles, MessageCircle } from "lucide-react";
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
    <div className="flex gap-4 mb-4 justify-between">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Badge
            variant="secondary"
            className="relative px-4 py-1.5 text-sm font-medium bg-card/80 backdrop-blur-xs rounded-full hover:bg-card/90 transition-all duration-200 shadow-xs hover:shadow-md"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-white" />
            AI Summary
          </Badge>
          <div className="flex items-center gap-2 text-sm text-white">
            <Calendar className="h-4 w-4 text-white " />
            {new Date(createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-white">
            <Clock className="h-4 w-4 text-white " />
            {readingTime} min read
          </div>
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold lg:tracking-tight">
          <span className="bg-gradient-to-r from-green-900 to-green-800 bg-clip-text text-transparent">{title}</span>
        </h1>
      </div>
      <div className="self-start flex gap-2">
        {summaryId && (
          <Link href={`/chatbot/${summaryId}`}>
            <Button
              size="sm"
              className="group flex items-center gap-2 bg-green-900 hover:bg-green-800 text-white rounded-full transition-all duration-200 shadow-xs hover:shadow-md px-3 py-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Chat with Document</span>
            </Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button
            variant="link"
            size="sm"
            className="group flex items-center gap-1 sm:gap-2 hover:bg-card/80 backdrop-blur-xs rounded-full transition-all duration-200 shadow-xs hover:shadow-md border border-green-900/30 bg-green-900/10 px-2 sm:px-3 hover:no-underline"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-white transition-transform group-hover:translate-x-0.5" />
            <span className="text-xs sm:text-sm text-white font-medium">
              Back <span className="hidden sm:inline">to Dashboard</span>
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
