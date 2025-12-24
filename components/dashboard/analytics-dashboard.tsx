"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
  DollarSign,
  Calendar,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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
          <p className="text-[#888] text-xl font-semibold mb-2">No analytics data available yet</p>
          <p className="text-[#555] text-sm">Upload your first document to see insights</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
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
      const weekData: { [key: string]: { documents: number; timeSaved: number; weekStart: Date } } =
        {};

      analytics.documentsOverTime.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekKey = weekStart.toISOString();

        if (!weekData[weekKey]) {
          weekData[weekKey] = { documents: 0, timeSaved: 0, weekStart };
        }
        weekData[weekKey].documents += item.count;
        weekData[weekKey].timeSaved += item.count * 0.5;
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
          timeSaved: week.timeSaved,
        };
      });
    } else {
      const monthlyData: { [key: string]: { documents: number; timeSaved: number } } = {};

      analytics.documentsOverTime.forEach((item) => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { documents: 0, timeSaved: 0 };
        }
        monthlyData[monthKey].documents += item.count;
        monthlyData[monthKey].timeSaved += item.count * 0.5;
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
        return existing ? { ...existing, month } : { month, documents: 0, timeSaved: 0 };
      });

      if (currentMonthIndex === 10 && !result.some((item) => item.month === "Nov")) {
        result.push({ month: "Nov", documents: 0, timeSaved: 0 });
      }

      return result;
    }
  };

  const chartData = processChartData();

  const getFilteredStats = () => {
    if (timeFilter === "weekly") {
      const last4Weeks = chartData.slice(-4);
      const totalDocs = last4Weeks.reduce((sum, item) => sum + item.documents, 0);
      const totalTimeSaved = last4Weeks.reduce((sum, item) => sum + item.timeSaved, 0);
      const totalValue = totalTimeSaved * 50;

      const thisWeek = last4Weeks[last4Weeks.length - 1]?.documents || 0;
      const lastWeek = last4Weeks[last4Weeks.length - 2]?.documents || 0;
      const growth = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

      return {
        totalDocuments: totalDocs,
        totalTimeSaved: totalTimeSaved,
        totalValue: totalValue,
        growth: growth,
        period: "Last 4 weeks",
      };
    } else {
      const last12Months = chartData.slice(-12);
      const totalDocs = last12Months.reduce((sum, item) => sum + item.documents, 0);
      const totalTimeSaved = last12Months.reduce((sum, item) => sum + item.timeSaved, 0);
      const totalValue = totalTimeSaved * 50;

      return {
        totalDocuments: analytics.totalDocuments,
        totalTimeSaved: analytics.totalTimeSavedHours,
        totalValue: analytics.totalMoneySaved,
        growth: analytics.monthOverMonthGrowth,
        period: "Last 12 months",
      };
    }
  };

  const filteredStats = getFilteredStats();

  const categoryData = [
    { name: "PDFs", value: Math.floor(analytics.totalDocuments * 0.65), color: "#F97316" },
    { name: "Documents", value: Math.floor(analytics.totalDocuments * 0.25), color: "#10B981" },
    { name: "Others", value: Math.floor(analytics.totalDocuments * 0.1), color: "#6366F1" },
  ];

  const forecastData = chartData.slice(-6).map((item, index) => ({
    month: item.month,
    actual: item.documents,
    forecast: item.documents * (1 + index * 0.1),
  }));

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
        title: "Documents Analytics",
        description: `You have processed ${analytics?.totalDocuments || 0} documents in total. ${
          analytics?.docsThisMonth || 0
        } documents were processed this month.`,
        icon: <FileText className="w-12 h-12 text-blue-400" />,
      },
      processing: {
        title: "Processing Analytics",
        description: `Your processing success rate is ${
          analytics?.successRate || 0
        }%. You've processed ${formatNumber(
          analytics?.totalWordsProcessed || 0
        )} words across all documents.`,
        icon: <Activity className="w-12 h-12 text-purple-400" />,
      },
      timeSaved: {
        title: "Time Saved Analytics",
        description: `You've saved ${
          analytics?.totalTimeSavedHours >= 24
            ? `${analytics.totalTimeSavedDays.toFixed(1)} days`
            : `${analytics?.totalTimeSavedHours.toFixed(1)} hours`
        } by using automated document processing instead of manual review.`,
        icon: <Clock className="w-12 h-12 text-orange-400" />,
      },
      value: {
        title: "Value Analytics",
        description: `The estimated value saved from automation is ${formatCurrency(
          analytics?.totalMoneySaved || 0
        )}. This is based on time saved and average hourly rates.`,
        icon: <DollarSign className="w-12 h-12 text-emerald-400" />,
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
          title: "Total Documents",
          description: `This value represents the total number of documents you have processed through the system. ${
            timeFilter === "weekly"
              ? "When viewing weekly data, this shows the count from the last 4 weeks."
              : "The count includes all documents processed since you started using the platform. The percentage change shows the growth or decline compared to the previous period."
          }`,
          icon: <FileText className="w-12 h-12 text-blue-400" />,
        },
        totalTimeSaved: {
          title: "Total Time Saved",
          description: `This metric calculates the time you've saved by using automated document processing instead of manual review. The calculation is based on an estimated 0.5 hours saved per document processed. ${
            timeFilter === "weekly"
              ? "When viewing weekly data, this shows the time saved in the last 4 weeks."
              : "The total accumulates all time saved across all your processed documents. This represents real time you can use for other important tasks."
          }`,
          icon: <Clock className="w-12 h-12 text-orange-400" />,
        },
        totalNetValue: {
          title: "Total Net Value",
          description: `This value represents the estimated monetary value saved through automation. It's calculated by multiplying the total time saved (in hours) by an estimated hourly rate of $50. ${
            timeFilter === "weekly"
              ? "When viewing weekly data, this shows the value from the last 4 weeks."
              : "This is a conservative estimate of the value you have gained by automating document processing instead of manual review. The actual value may vary based on your specific use case."
          }`,
          icon: <DollarSign className="w-12 h-12 text-emerald-400" />,
        },
        performanceForecast: {
          title: "Performance Forecast",
          description: `This chart shows your document processing trends over time and provides a forecast for future performance. The blue line represents your actual document processing data, while the pink dashed line shows the projected forecast based on your current growth patterns. The forecast helps you anticipate future processing needs and plan capacity accordingly.`,
          icon: <TrendingUp className="w-12 h-12 text-purple-400" />,
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
                Weekly
              </button>
              <button
                onClick={() => setTimeFilter("monthly")}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  timeFilter === "monthly"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#666] hover:text-white"
                }`}
              >
                Monthly
              </button>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1f1f1f] text-[#888] text-sm">
              {new Date()
                .toLocaleDateString("en-US", { month: "long", year: "numeric" })
                .replace("2024", "2025")}
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
                  <h3 className="text-lg font-medium text-white">Processing Efficiency</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#666]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">Success Rate</span>
                      <span className="text-xl font-semibold text-white tabular-nums">
                        {analytics.successRate}%
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${analytics.successRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#555]">
                      {analytics.totalDocuments > 0
                        ? `${
                            analytics.successRate >= 95
                              ? "Excellent"
                              : analytics.successRate >= 80
                              ? "Good"
                              : "Needs improvement"
                          } processing reliability`
                        : "No documents processed yet"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">Avg Words/Document</span>
                      <span className="text-xl font-semibold text-white tabular-nums">
                        {formatNumber(analytics.avgWordsPerDocument)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#555]" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#555]">Total Words</span>
                          <span className="text-[#888] font-medium tabular-nums">
                            {formatNumber(analytics.totalWordsProcessed)}
                          </span>
                        </div>
                        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#555] rounded-full"
                            style={{
                              width: `${Math.min(
                                (analytics.totalWordsProcessed / 100000) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">Processing Speed</span>
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#555]">Avg Time Saved</span>
                        <span className="text-lg font-bold text-white">
                          {analytics.totalDocuments > 0
                            ? `${(analytics.totalTimeSavedHours / analytics.totalDocuments).toFixed(
                                1
                              )}h`
                            : "0h"}
                        </span>
                      </div>
                      <div className="text-xs text-[#666]">Per document vs manual review</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">Volume Trend</span>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#555]">Growth Rate</span>
                        <span
                          className={`text-lg font-bold ${
                            analytics.monthOverMonthGrowth > 0
                              ? "text-emerald-400"
                              : analytics.monthOverMonthGrowth < 0
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          {analytics.monthOverMonthGrowth !== 0
                            ? `${analytics.monthOverMonthGrowth > 0 ? "+" : ""}${
                                analytics.monthOverMonthGrowth
                              }%`
                            : "0%"}
                        </span>
                      </div>
                      <div className="text-xs text-[#666]">
                        {analytics.monthOverMonthGrowth > 0
                          ? "Increasing processing activity"
                          : analytics.monthOverMonthGrowth < 0
                          ? "Decreasing processing activity"
                          : "Stable processing activity"}
                      </div>
                    </div>
                  </div>
                </div>

                {analytics.totalDocuments > 0 && (
                  <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-[#1f1f1f]">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-2">
                          Performance Recommendations
                        </h4>
                        <ul className="space-y-1 text-xs text-[#888]">
                          {analytics.successRate < 95 && (
                            <li>
                              • Consider reviewing failed documents to improve your{" "}
                              <span className="font-semibold text-orange-400">
                                {analytics.successRate}%
                              </span>{" "}
                              success rate
                            </li>
                          )}
                          {analytics.docsThisMonth < analytics.docsLastMonth &&
                            analytics.docsLastMonth > 0 && (
                              <li>
                                • Processing volume decreased by{" "}
                                <span className="font-semibold text-red-400">
                                  {Math.abs(analytics.monthOverMonthGrowth)}%
                                </span>{" "}
                                this month - consider increasing activity
                              </li>
                            )}
                          {analytics.avgWordsPerDocument > 1000 && (
                            <li>
                              • Large document sizes detected - processing may take longer but
                              provides more detailed insights
                            </li>
                          )}
                          {analytics.totalDocuments > 0 &&
                            analytics.successRate >= 95 &&
                            analytics.monthOverMonthGrowth >= 0 && (
                              <li>
                                • Excellent performance! Your processing efficiency is optimal -
                                keep up the great work
                              </li>
                            )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {analytics.totalDocuments > 0 && (
                  <>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#1f1f1f]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-[#666] font-medium">Processing Rate</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white">
                            {analytics.docsThisWeek > 0
                              ? (analytics.docsThisWeek / 7).toFixed(1)
                              : analytics.docsThisMonth > 0
                              ? (analytics.docsThisMonth / 30).toFixed(1)
                              : "0"}
                          </span>
                          <span className="text-xs text-[#666]">docs/day</span>
                        </div>
                        <p className="text-xs text-[#555]">
                          {analytics.docsThisWeek > 0
                            ? "Average daily processing this week"
                            : analytics.docsThisMonth > 0
                            ? "Average daily processing this month"
                            : "No recent activity"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-[#666] font-medium">Efficiency Score</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white">
                            {Math.round(
                              analytics.successRate * 0.7 +
                                Math.min((analytics.totalDocuments / 10) * 30, 30)
                            )}
                          </span>
                          <span className="text-xs text-[#666]">/100</span>
                        </div>
                        <p className="text-xs text-[#555]">
                          Based on success rate and processing volume
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-[#666] font-medium">Avg Document Size</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white">
                            {formatNumber(analytics.avgWordsPerDocument)}
                          </span>
                          <span className="text-xs text-[#666]">words</span>
                        </div>
                        <p className="text-xs text-[#555]">
                          {analytics.avgWordsPerDocument > 1000
                            ? "Large documents - complex processing"
                            : analytics.avgWordsPerDocument > 500
                            ? "Medium documents - standard processing"
                            : "Small documents - quick processing"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 p-3 rounded-lg bg-[#131313] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-[#666] font-medium">Cost Efficiency</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-white">
                            $
                            {(
                              analytics.totalMoneySaved / Math.max(analytics.totalDocuments, 1)
                            ).toFixed(0)}
                          </span>
                          <span className="text-xs text-[#666]">per doc</span>
                        </div>
                        <p className="text-xs text-[#555]">
                          Average value saved per document processed
                        </p>
                      </div>

                      <div className="space-y-2 p-3 rounded-lg bg-[#131313] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-orange-400" />
                          <span className="text-xs text-[#666] font-medium">
                            Processing Consistency
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-white">
                            {analytics.docsThisMonth > 0 && analytics.docsLastMonth > 0
                              ? Math.abs(analytics.monthOverMonthGrowth) < 20
                                ? "High"
                                : "Moderate"
                              : analytics.totalDocuments > 5
                              ? "Moderate"
                              : "Building"}
                          </span>
                        </div>
                        <p className="text-xs text-[#555]">
                          {analytics.docsThisMonth > 0 && analytics.docsLastMonth > 0
                            ? Math.abs(analytics.monthOverMonthGrowth) < 20
                              ? "Stable processing volume"
                              : "Variable processing patterns"
                            : "Establishing processing patterns"}
                        </p>
                      </div>

                      <div className="space-y-2 p-3 rounded-lg bg-[#131313] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs text-[#666] font-medium">Time Efficiency</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-white">
                            {analytics.totalDocuments > 0
                              ? `${(
                                  (analytics.totalTimeSavedHours / analytics.totalDocuments) *
                                  100
                                ).toFixed(0)}%`
                              : "0%"}
                          </span>
                        </div>
                        <p className="text-xs text-[#555]">
                          Time saved compared to manual processing
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-gray-800/40 to-gray-800/20 border border-[#1f1f1f]">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            {analytics.docsThisWeek > 0
                              ? analytics.docsThisWeek
                              : analytics.docsThisMonth}
                          </div>
                          <div className="text-xs text-[#666]">
                            {analytics.docsThisWeek > 0 ? "This Week" : "This Month"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400 mb-1">
                            {analytics.totalDocuments > 0
                              ? `${(
                                  analytics.totalWordsProcessed /
                                  analytics.totalDocuments /
                                  1000
                                ).toFixed(1)}K`
                              : "0K"}
                          </div>
                          <div className="text-xs text-[#666]">Avg Words/Doc</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">
                            {analytics.totalDocuments > 0
                              ? `${(
                                  (analytics.totalTimeSavedHours / analytics.totalDocuments) *
                                  60
                                ).toFixed(0)}`
                              : "0"}
                          </div>
                          <div className="text-xs text-[#666]">Mins Saved/Doc</div>
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
                  {timeFilter === "weekly" ? "Documents (Last 4 weeks)" : "Total Documents"}
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-white">
                    {filteredStats.totalDocuments.toLocaleString()}
                  </p>
                  {filteredStats.growth !== 0 && (
                    <span
                      className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                        filteredStats.growth > 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {filteredStats.growth > 0 ? "+" : ""}
                      {filteredStats.growth}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#555] leading-relaxed mt-auto">
                  {timeFilter === "weekly"
                    ? "This shows the count from the last 4 weeks."
                    : "Total number of documents processed through the system. The percentage change shows growth or decline compared to the previous period."}
                </p>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] flex flex-col">
              <div className="p-6 flex flex-col h-full">
                <p className="text-sm text-[#666] mb-2">
                  {timeFilter === "weekly" ? "Time Saved (Last 4 weeks)" : "Total Time Saved"}
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-white">
                    {timeFilter === "weekly"
                      ? filteredStats.totalTimeSaved.toFixed(1)
                      : filteredStats.totalTimeSaved >= 24
                      ? `${(filteredStats.totalTimeSaved / 24).toFixed(1)}`
                      : `${filteredStats.totalTimeSaved.toFixed(1)}`}
                    <span className="text-2xl text-[#666] ml-1">
                      {timeFilter === "weekly"
                        ? "hrs"
                        : filteredStats.totalTimeSaved >= 24
                        ? "days"
                        : "hrs"}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-[#555] leading-relaxed mt-auto">
                  {timeFilter === "weekly"
                    ? "Time saved in the last 4 weeks by using automated processing."
                    : "Calculated at 0.5 hours saved per document. This represents real time you can use for other important tasks."}
                </p>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] flex flex-col">
              <div className="p-6 flex flex-col h-full">
                <p className="text-sm text-[#666] mb-2">
                  {timeFilter === "weekly" ? "Value (Last 4 weeks)" : "Total Net Value"}
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-white">
                    {formatCurrency(filteredStats.totalValue).replace(".00", "")}
                  </p>
                </div>
                <p className="text-xs text-[#555] leading-relaxed mt-auto">
                  {timeFilter === "weekly"
                    ? "Estimated value from the last 4 weeks of automation."
                    : "Calculated by multiplying time saved (hours) by $50/hour. A conservative estimate of value gained through automation."}
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
                  <h3 className="text-lg font-bold text-white">Recent Activity</h3>
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

          <div className="flex">
            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] w-full flex flex-col">
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-6">Processing Analysis</h3>

                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-white">{analytics.successRate}%</p>
                      <p className="text-xs text-[#666]">Success</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-[#888]">PDFs</span>
                    </div>
                    <span className="text-white font-semibold">65%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[#888]">Documents</span>
                    </div>
                    <span className="text-white font-semibold">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-[#888]">Others</span>
                    </div>
                    <span className="text-white font-semibold">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="bg-[#111111] rounded-xl border border-[#1f1f1f] w-full flex flex-col">
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-6">Performance Forecast</h3>

                <div className="h-[200px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        dataKey="month"
                        stroke="#6B7280"
                        fontSize={11}
                        tick={{ fill: "#9CA3AF" }}
                      />
                      <YAxis stroke="#6B7280" fontSize={11} tick={{ fill: "#9CA3AF" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                          padding: "8px 12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: "#3B82F6", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#EC4899"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#EC4899", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#151515] border border-[#1f1f1f] mb-3">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#888]">
                    Expecting{" "}
                    <span className="font-semibold text-blue-400">
                      growth in {forecastData[forecastData.length - 1]?.month}
                    </span>
                    . Consider{" "}
                    <span className="font-semibold text-pink-400">expanding capacity</span> or
                    optimizing current workflows.
                  </p>
                </div>
                <p className="text-xs text-[#555] leading-relaxed">
                  The blue line shows your actual document processing data, while the pink dashed
                  line shows the projected forecast based on your current growth patterns. Helps you
                  anticipate future processing needs.
                </p>
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
                    View Summary
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
