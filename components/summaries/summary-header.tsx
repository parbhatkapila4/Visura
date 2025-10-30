"use client";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Sparkles,
  MessageCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

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
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="group flex items-center gap-3 hover:bg-gray-800/80 backdrop-blur-md rounded-xl transition-all duration-300 bg-gray-900/40 border border-gray-700/50 hover:border-orange-500/30 px-5 py-3 w-full sm:w-auto"
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

            {summaryId && (
              <Link href={`/chatbot/${summaryId}`} className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="group relative flex items-center gap-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:via-amber-400 hover:to-orange-400 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 px-6 py-3 w-full sm:w-auto overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm sm:text-base">
                        Chat with Document
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Button>
                </motion.div>
              </Link>
            )}
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

          {/* Metadata Cards */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* AI Summary Badge */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Badge
                variant="secondary"
                className="relative px-6 py-3 text-sm font-semibold bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 backdrop-blur-md rounded-full border border-orange-500/40 hover:border-orange-500/60 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="relative">
                    <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" />
                    <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-sm"></div>
                  </div>
                  <span className="text-white font-bold">AI Summary</span>
                </div>
              </Badge>
            </motion.div>

            {/* Reading time removed as requested */}

            {/* Date */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center gap-2.5 bg-gray-800/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
              </div>
              <span className="text-gray-200 font-semibold text-sm sm:text-base">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </motion.div>

            {/* Mobile Date */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex sm:hidden items-center gap-2.5 bg-gray-800/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
                <Calendar className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <span className="text-gray-200 font-semibold text-sm">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </motion.div>
          </motion.div>

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
