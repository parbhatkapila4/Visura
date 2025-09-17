"use client";
import { useState } from "react";
import { parseSection } from "@/utils/summary-helpers";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Eye, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SectionNavItem = ({ 
  title, 
  points, 
  isActive, 
  onClick 
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
    if (title.includes("Action") || title.includes("Recommendation")) return "✅";
    if (title.includes("Terms") || title.includes("Definition")) return "📚";
    if (title.includes("Context") || title.includes("Background")) return "🌍";
    if (title.includes("Bottom") || title.includes("Line")) return "🎯";
    return "📝";
  };

  const getSectionColor = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary")) return "text-blue-400";
    if (title.includes("Findings") || title.includes("Insights")) return "text-green-400";
    if (title.includes("Analysis")) return "text-purple-400";
    if (title.includes("Critical") || title.includes("Warning")) return "text-red-400";
    if (title.includes("Action") || title.includes("Recommendation")) return "text-emerald-400";
    if (title.includes("Terms") || title.includes("Definition")) return "text-orange-400";
    if (title.includes("Context") || title.includes("Background")) return "text-cyan-400";
    if (title.includes("Bottom") || title.includes("Line")) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-all duration-300 hover:bg-gray-800/50 ${
        isActive ? 'bg-gray-800/80 border-l-4 border-green-500' : 'hover:border-l-4 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getSectionIcon(title)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-200 mb-1 truncate">
            {title}
          </h3>
          <p className="text-xs text-gray-500">
            {points.length} insights
          </p>
        </div>
        {isActive && <ArrowRight className="w-4 h-4 text-green-400" />}
      </div>
    </button>
  );
};

const DarkContentSection = ({ 
  title, 
  points 
}: { 
  title: string; 
  points: string[]; 
}) => {
  const getSectionIcon = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary")) return "📋";
    if (title.includes("Findings") || title.includes("Insights")) return "🔍";
    if (title.includes("Analysis")) return "📊";
    if (title.includes("Critical") || title.includes("Warning")) return "⚠️";
    if (title.includes("Action") || title.includes("Recommendation")) return "✅";
    if (title.includes("Terms") || title.includes("Definition")) return "📚";
    if (title.includes("Context") || title.includes("Background")) return "🌍";
    if (title.includes("Bottom") || title.includes("Line")) return "🎯";
    return "📝";
  };

  const getSectionColor = (title: string) => {
    if (title.includes("Overview") || title.includes("Summary")) return "text-blue-400";
    if (title.includes("Findings") || title.includes("Insights")) return "text-green-400";
    if (title.includes("Analysis")) return "text-purple-400";
    if (title.includes("Critical") || title.includes("Warning")) return "text-red-400";
    if (title.includes("Action") || title.includes("Recommendation")) return "text-emerald-400";
    if (title.includes("Terms") || title.includes("Definition")) return "text-orange-400";
    if (title.includes("Context") || title.includes("Background")) return "text-cyan-400";
    if (title.includes("Bottom") || title.includes("Line")) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{getSectionIcon(title)}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              {title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {points.length} insights
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.ceil(points.length * 0.5)} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Content List */}
      <div className="space-y-6">
        {points.map((point, index) => {
          const emojiMatch = point.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u);
          const emoji = emojiMatch ? emojiMatch[0] : "•";
          const text = point.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u, "").replace(/^•\s*/, "").trim();

          const isActionItem = point.includes("✅") || point.includes("🎯") || point.includes("💡");
          const isWarning = point.includes("⚠️") || point.includes("🔒");
          const isData = point.includes("📊") || point.includes("📈");
          const isDefinition = point.includes(":") && emojiMatch;

          let emojiColor = "text-gray-400";
          let textColor = "text-gray-300";
          let borderColor = "border-gray-700";

          if (isActionItem) {
            emojiColor = "text-green-400";
            textColor = "text-gray-200";
            borderColor = "border-green-500/30";
          } else if (isWarning) {
            emojiColor = "text-red-400";
            textColor = "text-gray-200";
            borderColor = "border-red-500/30";
          } else if (isData) {
            emojiColor = "text-blue-400";
            textColor = "text-gray-200";
            borderColor = "border-blue-500/30";
          } else if (isDefinition) {
            emojiColor = "text-purple-400";
            textColor = "text-gray-200";
            borderColor = "border-purple-500/30";
          }

          return (
            <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${borderColor} hover:bg-gray-800/30 transition-colors duration-200`}>
              <span className={`text-2xl ${emojiColor} mt-1 flex-shrink-0`}>
                {emoji}
              </span>
              <p className={`${textColor} leading-relaxed text-base`}>
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function SummaryViewer({ summary }: { summary: string }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const sections = summary
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean)
    .map(parseSection);

  const handleNext = () =>
    setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1));
  const handlePrevious = () =>
    setCurrentSection((prev) => Math.max(prev - 1, 0));

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-900 min-h-screen">
      {/* Dark Header */}
      <div className="border-b border-gray-700 pb-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-1">Document Analysis</h1>
              <p className="text-gray-400 text-sm">Comprehensive insights and actionable intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
              className={`text-sm ${
                viewMode === 'overview' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'text-gray-300 border-gray-600 hover:bg-gray-800'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
              className={`text-sm ${
                viewMode === 'detailed' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'text-gray-300 border-gray-600 hover:bg-gray-800'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Detailed
            </Button>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-400 font-medium">
            {currentSection + 1} of {sections.length} sections
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        /* Overview Mode - Sidebar Navigation */
        <div className="flex gap-8">
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Sections</h3>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <SectionNavItem
                    key={index}
                    title={section.title}
                    points={section.points}
                    isActive={currentSection === index}
                    onClick={() => {
                      setCurrentSection(index);
                      setViewMode('detailed');
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <DarkContentSection
              title={sections[currentSection]?.title || ""}
              points={sections[currentSection]?.points || []}
            />
          </div>
        </div>
      ) : (
        /* Detailed Mode - Full content view */
        <div className="space-y-8">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className="text-gray-300 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <div className="text-gray-200 text-sm font-medium">
                  {currentSection + 1} of {sections.length}
                </div>
                <div className="text-gray-400 text-xs">
                  {sections[currentSection]?.title || ""}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentSection === sections.length - 1}
                className="text-gray-300 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Section dots */}
            <div className="flex gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSection 
                      ? 'bg-green-600 w-8' 
                      : 'bg-gray-600 hover:bg-gray-500 w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <DarkContentSection
              title={sections[currentSection]?.title || ""}
              points={sections[currentSection]?.points || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
