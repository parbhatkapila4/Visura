"use client";

import { parseSection } from "@/utils/summary-helpers";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

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
        <span className="text-2xl">{getSectionIcon(title)}</span>
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
}: {
  title: string;
  points: string[];
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
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
              {title}
            </h2>
          </div>
        </div>

        <div className="border-t border-gray-600 mb-3 sm:mb-4"></div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {points
          .map((point, index) => {
            const cleanText = point
              .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u, "")
              .replace(/\*\*(.*?)\*\*/g, "$1")
              .replace(/\*(.*?)\*/g, "$1")
              .replace(/^•\s*/, "")
              .trim();

            if (cleanText.toLowerCase().startsWith("type:")) {
              return null;
            }

            return (
              <p
                key={index}
                className="text-gray-300 leading-relaxed text-sm sm:text-base hover:text-gray-100 transition-colors duration-200"
              >
                {cleanText}
              </p>
            );
          })
          .filter(Boolean)}
      </div>
    </div>
  );
};

export default function SummaryViewer({ summary }: { summary: string }) {
  const sections = summary
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean)
    .map(parseSection);

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-orange-500/10 backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="mb-4 p-4 sm:p-6 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-t-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shadow-orange-500/25 animate-pulse">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Document Analysis
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                AI-Powered Document Intelligence
              </p>
            </div>
          </div>

          {/* Enhanced separator line */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent h-px"></div>
            <div className="border-t border-gray-600/50"></div>
          </div>

          {/* Enhanced summary info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 bg-gray-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-700/50">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              <span className="text-gray-300 font-medium">
                {sections.length} sections
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-700/50">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              <span className="text-gray-300 font-medium">
                {Math.ceil(
                  sections.reduce(
                    (total, section) => total + section.points.length,
                    0
                  ) * 0.5
                )}{" "}
                min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sections Display */}
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="relative group">
            {/* Section background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 space-y-4">
              <DarkContentSection
                title={`${index + 1}. ${section.title}`}
                points={section.points}
              />
              {index < sections.length - 1 && (
                <div className="relative my-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent h-px"></div>
                  <div className="border-t border-gray-700/50"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
