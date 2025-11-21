"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageCircle, BookOpen, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { toast } from "sonner";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div className="relative" ref={ref}>
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/5 rounded-3xl -m-6 p-6"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent rounded-3xl"></div>

      <div className="relative z-10">
        <div className="flex flex-col gap-8 mb-12">
          {/* Navigation & Actions */}
          <motion.div
            className="flex flex-row justify-between items-center w-full gap-2 sm:gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link href="/dashboard" className="w-auto ml-2 sm:ml-0">
              <motion.div
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className="group flex items-center gap-2 hover:bg-gray-800/80 backdrop-blur-md rounded-xl transition-all duration-300 bg-gray-900/40 border border-gray-700/50 hover:border-orange-500/30 px-3 py-2 sm:px-5 sm:py-3 w-auto"
                >
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 group-hover:from-orange-500/30 group-hover:to-amber-500/20 transition-all duration-300 border border-orange-500/20">
                    <ChevronLeft className="h-4 w-4 text-orange-400 transition-transform group-hover:-translate-x-1" />
                  </div>
                  <span className="font-semibold text-gray-200 group-hover:text-white text-sm sm:text-base transition-colors">
                    Back to Dashboard
                  </span>
                </Button>
              </motion.div>
            </Link>

            {/* Chat button removed from the top row as requested */}
          </motion.div>

          {/* Main Document Card */}
          <motion.div
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-full max-w-4xl">
              {/* Animated glow effect */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl blur-xl opacity-60"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-orange-500/60 via-amber-500/40 to-orange-500/60 rounded-3xl blur-md opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-8 sm:p-10 shadow-2xl">
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-tl-3xl rounded-br-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/20 to-transparent rounded-br-3xl rounded-tl-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
                    {/* Icon */}
                    <motion.div
                      className="flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-60"></div>
                        <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg border border-orange-400/50">
                          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <div className="min-w-0">
                      <motion.h1
                        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <span className="bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent drop-shadow-lg">
                          {title}
                        </span>
                      </motion.h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Replace badges with centered Chat and Share buttons */}
          {summaryId && (
            <motion.div
              className="flex justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href={`/chatbot/${summaryId}`}>
                <Button className="group relative flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:via-amber-400 hover:to-orange-400 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 px-4 py-2 sm:px-6 sm:py-3 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm sm:text-base">Chat with Document</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Button>
              </Link>
              <Button 
                onClick={async () => {
                  try {
                    // Generate or get share token
                    const response = await fetch(`/api/summaries/${summaryId}/share`, {
                      method: "POST",
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || "Failed to generate share link");
                    }

                    const data = await response.json();
                    const shareUrl = data.shareUrl;

                    // Try to use native share API first (mobile)
                    const shareData = {
                      title: title || "AI Summary",
                      text: `Check out this AI-generated summary: ${title || "Summary"}`,
                      url: shareUrl,
                    };

                    if (navigator.share && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                      toast.success("Summary shared successfully");
                    } else {
                      // Fallback to copying to clipboard
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success("Share link copied to clipboard!");
                    }
                  } catch (error) {
                    if (error instanceof Error && error.name === "AbortError") {
                      return;
                    }

                    // If native share failed, try clipboard
                    try {
                      const response = await fetch(`/api/summaries/${summaryId}/share`, {
                        method: "POST",
                      });
                      if (response.ok) {
                        const data = await response.json();
                        await navigator.clipboard.writeText(data.shareUrl);
                        toast.success("Share link copied to clipboard!");
                      } else {
                        throw error;
                      }
                    } catch (clipboardError) {
                      console.error("Share error:", error);
                      toast.error("Failed to share summary. Please try again.");
                    }
                  }
                }}
                className="group relative flex items-center gap-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-gray-500/20 hover:shadow-gray-500/40 px-4 py-2 sm:px-6 sm:py-3 overflow-hidden border border-gray-600/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm sm:text-base">Share</span>
                </div>
              </Button>
            </motion.div>
          )}

          {/* Decorative separator */}
          <motion.div
            className="relative h-px w-full max-w-3xl mx-auto"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-sm"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
