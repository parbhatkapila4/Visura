"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  FileText,
  MessageSquare,
  Download,
  Trash2,
  Search,
  Command,
  ArrowUpRight,
  Sparkles,
  Zap,
  Clock,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Crown,
  Folder,
  BarChart3,
  Settings,
  Bell,
  Grid3X3,
  List,
  Filter,
  SortDesc,
  Star,
  TrendingUp,
  Activity,
  Home,
  X,
} from "lucide-react";
import DeleteButton from "@/components/summaries/delete-button";
import DownloadSummaryButtonDashboard from "@/components/summaries/download-summary-button-dashboard";
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import { extractSummaryPreview } from "@/utils/summary-helpers";
import { formatFileName } from "@/lib/utils";

interface Summary {
  id: string;
  title: string | null;
  summary_text: string;
  original_file_url: string | null;
  created_at: string;
  status?: string;
}

interface DashboardClientProps {
  summaries: Summary[];
  uploadLimit: number;
  userPlan: string;
  hasReachedLimit: boolean;
}

const MagneticButton = ({
  children,
  className = "",
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};

const GlowCard = ({
  children,
  className = "",
  glowColor = "orange",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "orange" | "purple" | "blue" | "green";
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    orange: "rgba(249, 115, 22, 0.15)",
    purple: "rgba(168, 85, 247, 0.15)",
    blue: "rgba(59, 130, 246, 0.15)",
    green: "rgba(34, 197, 94, 0.15)",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${colors[glowColor]}, transparent 40%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      <div className="absolute inset-0 rounded-[inherit] border border-white/[0.08]" />
      <motion.div
        className="absolute inset-0 rounded-[inherit] border border-white/20 opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {children}
    </motion.div>
  );
};

const PremiumSummaryCard = ({
  summary,
  index,
  onDelete,
  isLarge = false,
  userPlan = "basic",
}: {
  summary: Summary;
  index: number;
  onDelete: () => void;
  isLarge?: boolean;
  userPlan?: string;
}) => {
  const fileName = summary.original_file_url ? formatFileName(summary.original_file_url) : null;
  const preview = extractSummaryPreview(summary.summary_text, summary.title, fileName);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    const status = summary.status?.toLowerCase() || "completed";
    if (status === "failed") return "bg-red-500";
    if (status === "processing") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const keyInsights = preview.keyPoints || [];
  const displayInsights = isLarge ? keyInsights.slice(0, 4) : keyInsights.slice(0, 0);
  const hasMoreInsights = keyInsights.length > (isLarge ? 4 : 0);

  const wordCount = summary.summary_text?.split(/\s+/).length || 0;
  const charCount = summary.summary_text?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group ${isLarge ? "col-span-2 row-span-2" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GlowCard
        className="h-full bg-[#0a0a0a] rounded-2xl cursor-pointer"
        glowColor={index % 2 === 0 ? "orange" : "purple"}
      >
        <div
          className="relative h-full p-5 sm:p-6 flex flex-col"
          onClick={() => (window.location.href = `/summaries/${summary.id}`)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/20">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStatusColor()} ring-2 ring-[#0a0a0a]`}
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
              </div>
            </div>

            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <DownloadSummaryButtonDashboard
                summaryId={summary.id}
                title={summary.title}
                summaryText={summary.summary_text}
                userPlan={userPlan}
              />
              <DeleteButton summaryId={summary.id} onDelete={onDelete} />
            </div>
          </div>

          <h3
            className={`font-semibold text-white mb-3 line-clamp-2 group-hover:text-orange-100 transition-colors ${
              isLarge ? "text-xl" : "text-base"
            }`}
          >
            {summary.title || preview.title || "Untitled Document"}
          </h3>

          <p
            className={`text-white/50 leading-relaxed mb-4 ${
              isLarge ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
            }`}
          >
            {preview.executiveSummary || "Processing..."}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-xs font-medium">
              {preview.documentType || "Document"}
            </span>
            {preview.keyPoints.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400/80 text-xs font-medium">
                {preview.keyPoints.length} insights
              </span>
            )}
          </div>

          {!isLarge && preview.keyPoints.length > 0 && (
            <div className="space-y-2 mb-3">
              {preview.keyPoints.slice(0, 2).map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-1 h-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-2 flex-1">
                    {insight.length > 80 ? `${insight.substring(0, 80)}...` : insight}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isLarge && (
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-white/40">
                <FileText className="w-3 h-3" />
                <span>{wordCount.toLocaleString()} words</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5 text-white/40">
                <Zap className="w-3 h-3" />
                <span>{(charCount / 1000).toFixed(1)}k chars</span>
              </div>
            </div>
          )}

          {isLarge && (
            <div className="flex-1 space-y-4 mb-4">
              {displayInsights.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <h4 className="text-sm font-semibold text-white">Key Insights</h4>
                  </div>
                  <div className="space-y-2.5">
                    {displayInsights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/insight"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-white/70 leading-relaxed flex-1 group-hover/insight:text-white/90 transition-colors">
                          {insight}
                        </p>
                      </motion.div>
                    ))}
                    {hasMoreInsights && (
                      <div className="text-xs text-white/40 italic pl-4">
                        +{keyInsights.length - 4} more insights
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Words</p>
                    <p className="text-sm font-semibold text-white">{wordCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Characters</p>
                    <p className="text-sm font-semibold text-white">{charCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all border border-white/10 hover:border-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/summaries/${summary.id}`;
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Full
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 text-xs font-medium transition-all border border-orange-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/chatbot/${summary.id}`;
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Start Chat
                </motion.button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/summaries/${summary.id}`;
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 text-xs font-medium transition-all border border-orange-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/chatbot/${summary.id}`;
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Chat
              </motion.button>
            </div>

            <motion.div
              className="flex items-center gap-1 text-white/30 group-hover:text-orange-400 transition-colors"
              animate={{ x: isHovered ? 3 : 0 }}
            >
              <span className="text-xs font-medium">Open</span>
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
};

const PremiumStatsGrid = ({
  totalDocs,
  thisWeek,
  completed,
  available,
  userPlan,
  uploadLimit,
}: {
  totalDocs: number;
  thisWeek: number;
  completed: number;
  available: number | string;
  userPlan: string;
  uploadLimit: number;
}) => {
  const isUnlimited = userPlan === "pro";
  const usagePercent = isUnlimited ? 35 : Math.min((totalDocs / uploadLimit) * 100, 100);
  const successRate = totalDocs > 0 ? Math.round((completed / totalDocs) * 100) : 100;
  const availableNum = typeof available === "number" ? available : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-950/40 via-[#0f0f0f] to-[#0a0a0a] border border-orange-500/10">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-semibold text-orange-400 uppercase tracking-wide">
              Primary
            </span>
          </div>

          <div className="mb-5">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-1">
              Total Documents
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white">{totalDocs}</span>
              <span className="text-sm text-white/30 font-medium">files</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/5">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Storage used</span>
              <span className="text-white/60 font-semibold">
                {isUnlimited ? "∞" : `${totalDocs}/${uploadLimit}`}
              </span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
              <div>
                <p className="text-[10px] text-white/30 uppercase">This Month</p>
                <p className="text-sm font-bold text-white">
                  {thisWeek + Math.floor(totalDocs * 0.4)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase">Weekly Avg</p>
                <p className="text-sm font-bold text-white">
                  {Math.max(1, Math.floor(totalDocs / 4))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/40 via-[#0f0f0f] to-[#0a0a0a] border border-violet-500/10">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative p-5 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            {thisWeek > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                <TrendingUp className="w-3 h-3" /> +{thisWeek}
              </span>
            )}
          </div>

          <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-1">
            This Week
          </p>
          <p className="text-4xl sm:text-5xl font-black text-white mb-4">{thisWeek}</p>

          <div className="mt-auto p-3 rounded-lg bg-black/30 border border-white/5">
            <p className="text-[10px] text-white/30 mb-2">Daily activity</p>
            <div className="flex items-end gap-1 h-10">
              {[25, 50, 35, 70, 45, 85, thisWeek > 0 ? 100 : 30].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 6
                        ? "linear-gradient(to top, #8b5cf6, #a78bfa)"
                        : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0f0f0f] to-[#0a0a0a] border border-emerald-500/10">
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative p-5 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-emerald-400">{successRate}%</span>
          </div>

          <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-1">
            Completed
          </p>
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-4xl sm:text-5xl font-black text-white">{completed}</span>
            <span className="text-sm text-white/30">/{totalDocs}</span>
          </div>

          <div className="mt-auto p-3 rounded-lg bg-black/30 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(successRate / 100) * 126} 126`}
                  />
                  <defs>
                    <linearGradient id="grad1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <Star
                  className="w-4 h-4 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  fill="currentColor"
                />
              </div>
              <div>
                <p className="text-[10px] text-white/30">Success rate</p>
                <p className="text-lg font-bold text-white">{successRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-2 lg:col-span-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/30 via-[#0a0a0a] to-cyan-950/30 border border-blue-500/10">
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-0.5">
                  Available Uploads
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {isUnlimited ? "∞" : availableNum}
                  </span>
                  {!isUnlimited && <span className="text-sm text-white/30">remaining</span>}
                  {isUnlimited && <span className="text-sm text-white/30">unlimited</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isUnlimited ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <Crown className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Pro Plan Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-8 rounded-sm ${
                          i < Math.ceil((availableNum / uploadLimit) * 10)
                            ? "bg-gradient-to-t from-blue-500 to-cyan-400"
                            : "bg-white/5"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30">Capacity</p>
                    <p className="text-sm font-bold text-white">
                      {Math.round((availableNum / uploadLimit) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full"
  >
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 p-12 sm:p-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center"
        >
          <FileText className="w-10 h-10 text-orange-400" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-3"
        >
          Start Your Journey
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/50 mb-8 leading-relaxed"
        >
          Upload your first document and let AI transform it into actionable insights. It only takes
          seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MagneticButton href="/upload">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-shadow cursor-pointer">
              <Plus className="w-5 h-5" />
              Upload Your First PDF
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

export default function DashboardClient({
  summaries: initialSummaries,
  uploadLimit,
  userPlan,
  hasReachedLimit,
}: DashboardClientProps) {
  const [summaries, setSummaries] = useState(initialSummaries);
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"documents" | "analytics">("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useUser();

  const filteredSummaries = summaries.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setSummaries((prev) => prev.filter((s) => s.id !== id));
  };

  const thisWeekCount = summaries.filter((s) => {
    const diff = Date.now() - new Date(s.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const completedCount = summaries.filter(
    (s) => !s.status || s.status.toLowerCase() === "completed"
  ).length;

  return (
    <div className="min-h-screen">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">Home</span>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            </div>

            <div className="hidden md:flex items-center">
              <motion.button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all min-w-[280px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/40">Search documents...</span>
                <div className="ml-auto flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/40 font-medium">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/40 font-medium">
                    K
                  </kbd>
                </div>
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              {userPlan === "pro" && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Pro</span>
                </div>
              )}

              <MagneticButton href="/upload">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    hasReachedLimit
                      ? "bg-white/5 text-white/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:block">New</span>
                </div>
              </MagneticButton>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-base"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredSummaries.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-sm">No documents found</div>
                ) : (
                  filteredSummaries.slice(0, 5).map((summary) => (
                    <motion.div
                      key={summary.id}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer"
                      onClick={() => {
                        setIsSearchOpen(false);
                        window.location.href = `/summaries/${summary.id}`;
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {summary.title || "Untitled"}
                        </p>
                        <p className="text-xs text-white/40">
                          {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 👋
          </h2>
          <p className="text-white/50">Here's what's happening with your documents</p>
        </motion.div>

        <div className="mb-10">
          <PremiumStatsGrid
            totalDocs={summaries.length}
            thisWeek={thisWeekCount}
            completed={completedCount}
            available={
              userPlan === "pro" ? "unlimited" : Math.max(0, uploadLimit - summaries.length)
            }
            userPlan={userPlan}
            uploadLimit={uploadLimit}
          />
        </div>

        {userPlan === "basic" && summaries.length >= uploadLimit * 0.7 && (
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950/50 via-[#0a0a0a] to-amber-950/50 border border-orange-500/20">
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-orange-500/20 rounded-full blur-3xl" />
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl" />

              <div className="relative p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/30 flex-shrink-0">
                      <Crown className="w-8 h-8 text-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">Upgrade to Pro</h3>
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-400 uppercase">
                          Limited
                        </span>
                      </div>
                      <p className="text-sm text-white/50 mb-4">
                        You've used{" "}
                        <span className="text-orange-400 font-bold">
                          {summaries.length}/{uploadLimit}
                        </span>{" "}
                        documents. Unlock unlimited access.
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="w-40">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                              style={{ width: `${(summaries.length / uploadLimit) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Zap className="w-3.5 h-3.5 text-orange-400" />
                          <span>Unlimited</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                          <span>Priority AI</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-shadow flex-shrink-0"
                  >
                    Upgrade Now
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
            {[
              { id: "documents", label: "Documents", icon: Folder },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "documents" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  activeView === "grid"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`p-2 rounded-lg transition-colors ${
                  activeView === "list"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "documents" ? (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {summaries.length === 0 ? (
                <EmptyState />
              ) : (
                <div
                  className={`grid gap-4 ${
                    activeView === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredSummaries.map((summary, index) => (
                    <PremiumSummaryCard
                      key={summary.id}
                      summary={summary}
                      index={index}
                      onDelete={() => handleDelete(summary.id)}
                      isLarge={activeView === "grid" && index === 0}
                      userPlan={userPlan}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {user?.id && <AnalyticsDashboard userId={user.id} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <KeyboardShortcuts onSearchOpen={() => setIsSearchOpen(true)} />
    </div>
  );
}

function KeyboardShortcuts({ onSearchOpen }: { onSearchOpen: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onSearchOpen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSearchOpen]);

  return null;
}
