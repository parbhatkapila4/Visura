"use client";

import { parseSection } from "@/utils/summary-helpers";
import { BookOpen, Clock, ArrowRight, Sparkles, Zap, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const SectionNavItem = ({
  title,
  points,
  isActive,
  onClick,
}: {
  title: string;
  points: string[];
  isActive: boolean;
  onClick: () => void;
}) => {
  const getSectionIcon = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary")) return "📋";
    if (title.includes("Findings") || title.includes("Insights")) return "🔍";
    if (title.includes("Analysis")) return "📊";
    if (title.includes("Critical") || title.includes("Warning")) return "⚠️";
    if (title.includes("Action") || title.includes("Recommendation"))
      return "✅";
    if (title.includes("Terms") || title.includes("Definition")) return "📚";
    if (title.includes("Context") || title.includes("Background")) return "🌍";
    if (title.includes("Bottom") || title.includes("Line")) return "🎯";
    return "📝";
  };

  const getSectionColor = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary"))
      return "text-blue-400";
    if (title.includes("Findings") || title.includes("Insights"))
      return "text-orange-400";
    if (title.includes("Analysis")) return "text-amber-400";
    if (title.includes("Critical") || title.includes("Warning"))
      return "text-red-400";
    if (title.includes("Action") || title.includes("Recommendation"))
      return "text-emerald-400";
    if (title.includes("Terms") || title.includes("Definition"))
      return "text-orange-400";
    if (title.includes("Context") || title.includes("Background"))
      return "text-cyan-400";
    if (title.includes("Bottom") || title.includes("Line"))
      return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-all duration-300 hover:bg-gray-800/50 ${
        isActive
          ? "bg-gray-800/80 border-l-4 border-orange-500"
          : "hover:border-l-4 hover:border-gray-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-2xl">{getSectionIcon(title)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-200 mb-1 truncate">
            {title}
          </h3>
          <p className="text-xs text-gray-500">{points.length} insights</p>
        </div>
        {isActive && <ArrowRight className="w-4 h-4 text-orange-500" />}
      </div>
    </button>
  );
};

const DarkContentSection = ({
  title,
  points,
  index,
}: {
  title: string;
  points: string[];
  index: number;
}) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const getSectionIcon = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary")) return "📋";
    if (title.includes("Findings") || title.includes("Insights")) return "🔍";
    if (title.includes("Analysis")) return "📊";
    if (title.includes("Critical") || title.includes("Warning")) return "⚠️";
    if (title.includes("Action") || title.includes("Recommendation"))
      return "✅";
    if (title.includes("Terms") || title.includes("Definition")) return "📚";
    if (title.includes("Context") || title.includes("Background")) return "🌍";
    if (title.includes("Bottom") || title.includes("Line")) return "🎯";
    return "📝";
  };

  const getSectionColor = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary"))
      return "from-blue-500/20 to-blue-600/10 border-blue-500/30";
    if (title.includes("Findings") || title.includes("Insights"))
      return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
    if (title.includes("Analysis"))
      return "from-amber-500/20 to-amber-600/10 border-amber-500/30";
    if (title.includes("Critical") || title.includes("Warning"))
      return "from-red-500/20 to-red-600/10 border-red-500/30";
    if (title.includes("Action") || title.includes("Recommendation"))
      return "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30";
    if (title.includes("Terms") || title.includes("Definition"))
      return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
    if (title.includes("Context") || title.includes("Background"))
      return "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30";
    if (title.includes("Bottom") || title.includes("Line"))
      return "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    return "from-gray-500/20 to-gray-600/10 border-gray-500/30";
  };

  const colorClass = getSectionColor(title);

  return (
    <motion.div
      ref={sectionRef}
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Section Header */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-4 text-center sm:text-left">
          {/* Section Number Badge */}
          <motion.div
            className="flex-shrink-0 hidden sm:block"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2, type: "spring" }}
          >
            <div className={`relative bg-gradient-to-br ${colorClass} p-3 rounded-xl border backdrop-blur-sm shadow-lg`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <span className="relative text-2xl">{getSectionIcon(title)}</span>
            </div>
          </motion.div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <motion.h2
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
            >
              {title}
            </motion.h2>
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto sm:mx-0"
              initial={{ width: 0 }}
              animate={isInView ? { width: 80 } : { width: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content Points */}
      <div className="space-y-4 sm:space-y-5 pl-0 sm:pl-16">
        {points && points.length > 0 ? (
          points
            .map((point, pointIndex) => {
              const cleanText = point
                .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u, "")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")
                .replace(/^•\s*/, "")
                .trim();

              if (!cleanText || cleanText.length === 0 || cleanText.toLowerCase().startsWith("type:")) {
                return null;
              }

              return (
                <motion.div
                  key={pointIndex}
                  className="group relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + pointIndex * 0.05 + 0.2 }}
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Decorative line (hide on mobile to balance left/right padding) */}
                    <div className="hidden sm:block flex-shrink-0 w-1 h-full bg-gradient-to-b from-orange-500/40 via-amber-500/30 to-transparent rounded-full group-hover:from-orange-500/60 group-hover:via-amber-500/50 transition-all duration-300"></div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1 overflow-hidden">
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base text-left sm:text-justify break-all sm:break-words hyphens-auto overflow-hidden group-hover:text-gray-100 transition-colors duration-300">
                        {cleanText}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
            .filter(Boolean)
        ) : (
          <motion.div
            className="text-gray-400 italic text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
          >
            No content available for this section.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function SummaryViewer({ summary }: { summary: string }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const sections = summary
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean)
    .map(parseSection);

  const totalInsights = sections.reduce(
    (total, section) => total + section.points.length,
    0
  );
  const estimatedReadTime = Math.ceil(totalInsights * 0.5);

  return (
    <motion.div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto relative overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>

        {/* Header Section */}
        <motion.div
          className="relative px-3 py-6 sm:p-8 lg:p-10 border-b border-gray-800/50"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg border border-orange-400/50">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </motion.div>
              <div>
                <motion.h1
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Document Analysis
                </motion.h1>
                <motion.p
                  className="text-gray-400 text-sm sm:text-base flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                  AI-Powered Document Intelligence
                </motion.p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Sections Stat */}
            <motion.div
              className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/40 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
                    <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Sections</span>
                </div>
                <div className="text-3xl font-bold text-white text-center sm:text-left w-full">{sections.length}</div>
              </div>
            </motion.div>

            {/* Insights Stat */}
            <motion.div
              className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/40 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Insights</span>
                </div>
                <div className="text-3xl font-bold text-white text-center sm:text-left w-full">{totalInsights}</div>
              </div>
            </motion.div>

            {/* Read Time Stat */}
            <motion.div
              className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/40 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Read Time</span>
                </div>
                <div className="text-3xl font-bold text-white text-center sm:text-left w-full">{estimatedReadTime} min</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Sections Display */}
        <div className="px-3 py-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              {/* Section Card */}
              <div className="relative bg-gradient-to-br from-gray-800/30 via-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 px-3 py-6 sm:p-8 hover:border-orange-500/30 transition-all duration-500 overflow-hidden">
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <DarkContentSection
                    title={`${index + 1}. ${section.title}`}
                    points={section.points}
                    index={index}
                  />
                </div>

                {/* Section Divider */}
                {index < sections.length - 1 && (
                  <motion.div
                    className="relative mt-8 sm:mt-12"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent h-px"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent h-px blur-sm"></div>
                    <div className="border-t border-gray-700/30"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
