"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Clock,
  BarChart3,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  totalDocuments: number;
  totalWordsProcessed: number;
  avgWordsPerDocument: number;
  successRate: number;
  totalTimeSavedHours: number;
  totalTimeSavedDays: number;
  totalMoneySaved: number;
  docsThisMonth: number;
  docsLastMonth: number;
  docsThisWeek: number;
  monthOverMonthGrowth: number;
  documentsOverTime: Array<{ date: string; count: number }>;
  recentActivity: Array<{ id: string; title: string; action: string; timestamp: string }>;
}

export default function AnalyticsDashboard({ userId }: { userId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    description: string;
    icon: React.ReactNode;
  } | null>(null);
  const [infoModalCard, setInfoModalCard] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  useEffect(() => {
    if (!mounted) return;

    if (showModal) {
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;

      const originalBodyOverflow = body.style.overflow;
      const originalBodyPosition = body.style.position;
      const originalBodyTop = body.style.top;
      const originalBodyWidth = body.style.width;
      const originalHtmlOverflow = html.style.overflow;

      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      html.style.overflow = "hidden";
      html.style.height = "100%";

      return () => {
        body.style.overflow = originalBodyOverflow;
        body.style.position = originalBodyPosition;
        body.style.top = originalBodyTop;
        body.style.width = originalBodyWidth;
        html.style.overflow = originalHtmlOverflow;
        html.style.height = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [showModal, mounted]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-[#1f1f1f] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-orange-400" />
          </div>
          <p className="text-[#888] text-xl font-semibold mb-2">Analytics failed to load</p>
          <p className="text-[#555] text-sm">Reload the page to try again.</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const userName = user?.fullName || user?.firstName || "User";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const processChartData = () => {
    if (timeFilter === "weekly") {
      const weekData: { [key: string]: { documents: number; weekStart: Date } } = {};

      analytics.documentsOverTime.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekKey = weekStart.toISOString();

        if (!weekData[weekKey]) {
          weekData[weekKey] = { documents: 0, weekStart };
        }
        weekData[weekKey].documents += item.count;
      });

      const sortedWeeks = Object.values(weekData).sort(
        (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
      );

      const recentWeeks = sortedWeeks.slice(-8);

      const firstWeekEverIndex = 0;

      return recentWeeks.map((week) => {
        const weekIndex = sortedWeeks.findIndex(
          (w) => w.weekStart.getTime() === week.weekStart.getTime()
        );
        const weekNum = weekIndex + 1;
        const month = week.weekStart.toLocaleDateString("en-US", { month: "short" });
        return {
          month: `Week ${weekNum} ${month}`,
          documents: week.documents,
        };
      });
    } else {
      const monthlyData: { [key: string]: { documents: number } } = {};

      analytics.documentsOverTime.forEach((item) => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { documents: 0 };
        }
        monthlyData[monthKey].documents += item.count;
      });

      const allMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const now = new Date();
      const currentMonthIndex = now.getMonth();

      const monthsToShow = allMonths.slice(0, currentMonthIndex + 1);

      const result = monthsToShow.map((month) => {
        const existing = monthlyData[month];
        return existing ? { ...existing, month } : { month, documents: 0 };
      });

      if (currentMonthIndex === 10 && !result.some((item) => item.month === "Nov")) {
        result.push({ month: "Nov", documents: 0 });
      }

      return result;
    }
  };

  const chartData = processChartData();

  const getFilteredStats = () => {
    if (timeFilter === "weekly") {
      const last4Weeks = chartData.slice(-4);
      const totalDocs = last4Weeks.reduce((sum, item) => sum + item.documents, 0);

      return {
        totalDocuments: totalDocs,
        period: "Recent weeks",
      };
    } else {
      const last12Months = chartData.slice(-12);
      const totalDocs = last12Months.reduce((sum, item) => sum + item.documents, 0);

      return {
        totalDocuments: analytics.totalDocuments,
        period: "All time",
      };
    }
  };

  const filteredStats = getFilteredStats();

  const handleTabClick = (tab: string) => {
    if (tab === "summary") {
      setActiveTab("summary");
      setShowModal(false);
      return;
    }

    const modalContents: {
      [key: string]: { title: string; description: string; icon: React.ReactNode };
    } = {
      documents: {
        title: "Documents",
        description: `You have ${analytics?.totalDocuments || 0} documents. ${
          analytics?.docsThisMonth || 0
        } were uploaded this month.`,
        icon: <FileText className="w-12 h-12 text-blue-400" />,
      },
    };

    setModalContent(modalContents[tab] || null);
    setShowModal(true);
  };

  const handleInfoClick = (cardType: string) => {
    try {
      const infoContents: {
        [key: string]: { title: string; description: string; icon: React.ReactNode };
      } = {
        totalDocuments: {
          title: "Total documents",
          description: `${
            timeFilter === "weekly"
              ? "Documents uploaded in your 4 most recent weeks with at least one upload, looking back no more than 30 days."
              : "Documents on your account, including any still processing."
          }`,
          icon: <FileText className="w-12 h-12 text-blue-400" />,
        },
      };

      const content = infoContents[cardType];
      if (content) {
        setInfoModalCard(cardType);
        setModalContent(content);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error opening info modal:", error);
    }
  };

  return (
    <div className="bg-[#0a0a0a]">
      <div className="pb-6 border-b border-[#1f1f1f] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Document analytics</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-[#111] border border-[#1f1f1f]">
              <button
                onClick={() => setTimeFilter("weekly")}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  timeFilter === "weekly"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#666] hover:text-white"
                }`}
              >
                Recent weeks
              </button>
              <button
                onClick={() => setTimeFilter("monthly")}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  timeFilter === "monthly"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#666] hover:text-white"
                }`}
              >
                All time
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex">
            <div className="relative bg-[#111111] rounded-xl border border-[#1f1f1f] w-full flex flex-col">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-medium text-white">Summaries</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#666]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">
                        Approx. summary words per document
                      </span>
                      <span className="text-xl font-semibold text-white tabular-nums">
                        {formatNumber(analytics.avgWordsPerDocument)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#555]" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#555]">Approx. words across all summaries</span>
                          <span className="text-[#888] font-medium tabular-nums">
                            {formatNumber(analytics.totalWordsProcessed)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {analytics.totalDocuments > 0 && (
                  <>
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-gray-800/40 to-gray-800/20 border border-[#1f1f1f]">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            {analytics.docsThisWeek > 0
                              ? analytics.docsThisWeek
                              : analytics.docsThisMonth}
                          </div>
                          <div className="text-xs text-[#666]">
                            {analytics.docsThisWeek > 0 ? "This week" : "This month"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 flex flex-col">
            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] flex flex-col">
              <div className="p-6 flex flex-col h-full">
                <p className="text-sm text-[#666] mb-2">
                  {timeFilter === "weekly" ? "Documents (last 4 active weeks)" : "Total documents"}
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-white">
                    {filteredStats.totalDocuments.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-[#555] leading-relaxed mt-auto">
                  {timeFilter === "weekly"
                    ? "Documents uploaded in your 4 most recent weeks with at least one upload, looking back no more than 30 days."
                    : "Documents on your account, including any still processing."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="flex">
            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] w-full flex flex-col">
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Recent activity</h3>
                  <Clock className="w-5 h-5 text-[#666]" />
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-0">
                  {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                    analytics.recentActivity.slice(0, 5).map((activity, index) => {
                      const date = new Date(activity.timestamp);
                      const timeAgo = formatDistanceToNow(date, { addSuffix: true });
                      const isRecent = Date.now() - date.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[#151515] hover:bg-[#1a1a1a] transition-colors border border-[#1f1f1f]"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              isRecent ? "bg-emerald-400" : "bg-gray-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#666]">{activity.action}</span>
                              <span className="text-xs text-[#555]">•</span>
                              <span className="text-xs text-[#555]">{timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-[#555] mx-auto mb-3" />
                      <p className="text-sm text-[#666]">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mounted &&
        showModal &&
        modalContent &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: 0,
              padding: "1rem",
              pointerEvents: "auto",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setInfoModalCard(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowModal(false);
                setInfoModalCard(null);
              }
            }}
          >
            <div
              className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-md w-full my-auto"
              style={{
                maxHeight: "90vh",
                overflowY: "auto",
                overflowX: "hidden",
                pointerEvents: "auto",
                position: "relative",
                zIndex: 10000,
                margin: "auto",
                WebkitOverflowScrolling: "touch",
              }}
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f]">
                  {modalContent.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{modalContent.title}</h2>
              </div>

              <p className="text-[#888] text-lg leading-relaxed mb-6 whitespace-pre-line">
                {modalContent.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(false);
                    setInfoModalCard(null);
                  }}
                  className="flex-1 px-6 py-3 bg-[#1a1a1a] hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  type="button"
                >
                  Close
                </button>
                {!infoModalCard && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowModal(false);
                      setInfoModalCard(null);
                      setTimeout(() => {
                        window.location.href = "/dashboard";
                      }, 100);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
                    type="button"
                  >
                    Go to dashboard
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
