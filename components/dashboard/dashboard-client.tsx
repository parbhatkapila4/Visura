"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  FileText,
  MessageSquare,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  Eye,
  ChevronRight,
  Crown,
  Folder,
  BarChart3,
  Grid3X3,
  List,
  TrendingUp,
  Activity,
  Home,
  X,
  LucideIcon,
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

const GlowCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "orange" | "purple" | "blue" | "green";
}) => {
  return (
    <div
      className={`relative bg-[#111111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors duration-200 ${className}`}
    >
      {children}
    </div>
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

  const getStatusColor = () => {
    const status = summary.status?.toLowerCase() || "completed";
    if (status === "failed") return "bg-red-500";
    if (status === "processing") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const wordCount = summary.summary_text?.split(/\s+/).length || 0;

  return (
    <div
      className={`group relative bg-[#111111] rounded-xl border border-[#1f1f1f] hover:border-[#333] transition-all duration-200 cursor-pointer ${
        isLarge ? "col-span-2 row-span-2" : ""
      }`}
      onClick={() => (window.location.href = `/summaries/${summary.id}`)}
    >
      <div className={`p-4 ${isLarge ? "p-5" : ""} h-full flex flex-col`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#666]" />
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${getStatusColor()} ring-2 ring-[#111111]`}
              />
            </div>
            <span className="text-xs text-[#555]">
              {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
            </span>
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
          className={`font-medium text-white mb-2 line-clamp-2 ${isLarge ? "text-lg" : "text-sm"}`}
        >
          {summary.title || preview.title || "Untitled Document"}
        </h3>

        <p
          className={`text-[#666] leading-relaxed mb-3 ${
            isLarge ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
          }`}
        >
          {preview.executiveSummary || "Processing..."}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 rounded bg-[#1a1a1a] text-[#666] text-xs">
            {preview.documentType || "Document"}
          </span>
          {preview.keyPoints.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#1a1a1a] text-[#666] text-xs">
              {preview.keyPoints.length} insights
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-[#1a1a1a] text-[#666] text-xs">
            {wordCount.toLocaleString()} words
          </span>
        </div>

        {isLarge && preview.keyPoints.length > 0 && (
          <div className="flex-1 mb-3">
            <div className="space-y-1.5">
              {preview.keyPoints.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-[#333] mt-1">•</span>
                  <p className="text-[#888] line-clamp-1">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#1f1f1f] mt-auto">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] hover:bg-[#222] text-[#888] hover:text-white text-xs transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/summaries/${summary.id}`;
              }}
            >
              <Eye className="w-3 h-3" />
              View
            </button>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] hover:bg-[#222] text-[#888] hover:text-white text-xs transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/chatbot/${summary.id}`;
              }}
            >
              <MessageSquare className="w-3 h-3" />
              Chat
            </button>
          </div>

          <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-[#666] transition-colors" />
        </div>
      </div>
    </div>
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

  const StatCard = ({
    label,
    value,
    suffix,
    sublabel,
    icon: Icon,
    trend,
    children,
  }: {
    label: string;
    value: number | string;
    suffix?: string;
    sublabel?: string;
    icon: LucideIcon;
    trend?: { value: number; positive: boolean };
    children?: React.ReactNode;
  }) => (
    <div className="relative bg-[#111111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#888]" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend.positive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {trend.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trend.positive ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#666] font-medium uppercase tracking-wider mb-1">{label}</p>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold text-white tracking-tight tabular-nums">
            {value}
          </span>
          {suffix && <span className="text-sm text-[#555]">{suffix}</span>}
        </div>

        {sublabel && <p className="text-xs text-[#555] mt-1">{sublabel}</p>}

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Documents"
        value={totalDocs}
        suffix="files"
        icon={FileText}
        trend={totalDocs > 0 ? { value: 12, positive: true } : undefined}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#555]">Storage</span>
            <span className="text-[#888] tabular-nums">
              {isUnlimited ? "∞" : `${totalDocs}/${uploadLimit}`}
            </span>
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#666] to-[#888] rounded-full transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </StatCard>

      <StatCard
        label="This Week"
        value={thisWeek}
        suffix="new"
        icon={Clock}
        trend={thisWeek > 0 ? { value: thisWeek * 10, positive: true } : undefined}
      >
        <div className="flex items-end gap-1 h-8">
          {[20, 35, 25, 50, 40, 65, thisWeek > 0 ? 100 : 30].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                height: `${h}%`,
                backgroundColor: i === 6 ? "#888" : "#1f1f1f",
              }}
            />
          ))}
        </div>
      </StatCard>

      <StatCard label="Completed" value={completed} suffix={`/ ${totalDocs}`} icon={Activity}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#1f1f1f" strokeWidth="3" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(successRate / 100) * 100.5} 100.5`}
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#555]">Success rate</p>
            <p className="text-sm font-semibold text-emerald-500 tabular-nums">{successRate}%</p>
          </div>
        </div>
      </StatCard>

      <StatCard
        label="Available"
        value={isUnlimited ? "∞" : availableNum}
        suffix={isUnlimited ? "" : "left"}
        sublabel={isUnlimited ? "Unlimited uploads" : undefined}
        icon={Zap}
      >
        {isUnlimited ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-[#252525]">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-[#888]">Pro Plan</span>
          </div>
        ) : (
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-6 rounded-sm ${
                  i < Math.ceil((availableNum / uploadLimit) * 10) ? "bg-[#555]" : "bg-[#1a1a1a]"
                }`}
              />
            ))}
          </div>
        )}
      </StatCard>
    </div>
  );
};

const EmptyState = () => (
  <div className="col-span-full">
    <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
        <FileText className="w-6 h-6 text-[#555]" />
      </div>

      <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
      <p className="text-[#666] text-sm mb-6 max-w-sm mx-auto">
        Upload your first document to get started with AI-powered summaries.
      </p>

      <Link
        href="/upload"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Upload Document
      </Link>
    </div>
  </div>
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
    <div className="min-h-screen w-full flex flex-col items-center">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm hidden sm:block">Home</span>
              </Link>
              <span className="text-[#333]">/</span>
              <h1 className="text-sm font-medium text-white">Dashboard</h1>
            </div>

            <div className="hidden md:flex items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-[#1f1f1f] hover:border-[#333] transition-colors min-w-[240px]"
              >
                <Search className="w-3.5 h-3.5 text-[#555]" />
                <span className="text-sm text-[#555]">Search...</span>
                <div className="ml-auto flex items-center gap-0.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[10px] text-[#555] font-mono">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[10px] text-[#555] font-mono">
                    K
                  </kbd>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {userPlan === "pro" && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111] border border-[#1f1f1f]">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-[#888]">Pro</span>
                </div>
              )}

              <Link
                href={hasReachedLimit ? "#" : "/upload"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hasReachedLimit
                    ? "bg-[#1a1a1a] text-[#555] cursor-not-allowed"
                    : "bg-white text-black hover:bg-[#e5e5e5]"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:block">New</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-lg bg-[#111] rounded-lg border border-[#1f1f1f] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1f1f1f]">
                <Search className="w-4 h-4 text-[#555]" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-[#555] outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 rounded hover:bg-[#1f1f1f] text-[#555] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {filteredSummaries.length === 0 ? (
                  <div className="py-12 text-center text-[#555] text-sm">No documents found</div>
                ) : (
                  filteredSummaries.slice(0, 6).map((summary) => (
                    <div
                      key={summary.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        window.location.href = `/summaries/${summary.id}`;
                      }}
                    >
                      <div className="w-8 h-8 rounded-md bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#666]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{summary.title || "Untitled"}</p>
                        <p className="text-xs text-[#555]">
                          {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#333]" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h2>
          <p className="text-[#666] text-sm">Here's an overview of your documents</p>
        </div>

        <div className="mb-6">
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
          <div className="mb-6">
            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {summaries.length}/{uploadLimit} documents used
                    </p>
                    <p className="text-xs text-[#666]">Upgrade to Pro for unlimited access</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#666] rounded-full"
                      style={{ width: `${(summaries.length / uploadLimit) * 100}%` }}
                    />
                  </div>
                  <Link
                    href="/checkout"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors"
                  >
                    Upgrade
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#111] border border-[#1f1f1f]">
            {[
              { id: "documents", label: "Documents", icon: Folder },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "documents" | "analytics")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  activeTab === tab.id ? "bg-[#1a1a1a] text-white" : "text-[#666] hover:text-white"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "documents" && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#111] border border-[#1f1f1f]">
              <button
                onClick={() => setActiveView("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  activeView === "grid" ? "bg-[#1a1a1a] text-white" : "text-[#555] hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  activeView === "list" ? "bg-[#1a1a1a] text-white" : "text-[#555] hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {activeTab === "documents" ? (
          <div>
            {summaries.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                className={`grid gap-3 ${
                  activeView === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredSummaries.map((summary, index) => (
                  <PremiumSummaryCard
                    key={summary.id}
                    summary={summary}
                    index={index}
                    onDelete={() => handleDelete(summary.id)}
                    isLarge={activeView === "grid" && index === 0 && filteredSummaries.length > 2}
                    userPlan={userPlan}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>{user?.id && <AnalyticsDashboard userId={user.id} />}</div>
        )}
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
