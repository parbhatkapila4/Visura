"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown
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
  Legend
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
  const [activeTab, setActiveTab] = useState('summary');
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; description: string; icon: React.ReactNode } | null>(null);
  const { user } = useUser();
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-800/50 animate-pulse" />
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
          <p className="text-gray-300 text-xl font-semibold mb-2">No analytics data available yet</p>
          <p className="text-gray-500 text-sm">Upload your first document to see insights</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Process data based on time filter (weekly or monthly)
  const processChartData = () => {
    if (timeFilter === 'weekly') {
      // Group by week (last 8 weeks)
      const weekData: { [key: string]: { documents: number; timeSaved: number; weekStart: Date } } = {};
      
      analytics.documentsOverTime.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString();
        
        if (!weekData[weekKey]) {
          weekData[weekKey] = { documents: 0, timeSaved: 0, weekStart };
        }
        weekData[weekKey].documents += item.count;
        weekData[weekKey].timeSaved += item.count * 0.5;
      });

      // Sort by week start date chronologically (oldest first)
      const sortedWeeks = Object.values(weekData)
        .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
      
      // Get last 8 weeks to display (most recent)
      const recentWeeks = sortedWeeks.slice(-8);
      
      // Week 1 is the FIRST week they ever uploaded (first week in the entire dataset)
      // So we number based on position in the full sorted array, not just the recent 8
      const firstWeekEverIndex = 0; // First week in sortedWeeks is Week 1
      
      return recentWeeks.map((week) => {
        // Find this week's position in the full sorted array
        const weekIndex = sortedWeeks.findIndex(w => 
          w.weekStart.getTime() === week.weekStart.getTime()
        );
        const weekNum = weekIndex + 1; // Week 1 is the first week with data
        const month = week.weekStart.toLocaleDateString('en-US', { month: 'short' });
        return {
          month: `Week ${weekNum} ${month}`,
          documents: week.documents,
          timeSaved: week.timeSaved,
        };
      });
    } else {
      // Group by month
      const monthlyData: { [key: string]: { documents: number; timeSaved: number } } = {};
      
      analytics.documentsOverTime.forEach((item) => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { documents: 0, timeSaved: 0 };
        }
        monthlyData[monthKey].documents += item.count;
        monthlyData[monthKey].timeSaved += item.count * 0.5;
      });

      // Fill in all months from January to current month (November 2025)
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const currentMonthIndex = now.getMonth(); // November = 10 (0-indexed), so slice(0, 11) gives Jan-Nov
      
      // Always include all months from Jan to current month (Nov) - this includes November
      const monthsToShow = allMonths.slice(0, currentMonthIndex + 1);
      
      const result = monthsToShow.map(month => {
        const existing = monthlyData[month];
        return existing || { month, documents: 0, timeSaved: 0 };
      });
      
      // Final verification: ensure November is included if we're in November
      if (currentMonthIndex === 10 && !result.some(item => item.month === 'Nov')) {
        result.push({ month: 'Nov', documents: 0, timeSaved: 0 });
      }
      
      return result;
    }
  };

  const chartData = processChartData();

  // Calculate filtered statistics based on time period
  const getFilteredStats = () => {
    if (timeFilter === 'weekly') {
      // Get last 4 weeks of data
      const last4Weeks = chartData.slice(-4);
      const totalDocs = last4Weeks.reduce((sum, item) => sum + item.documents, 0);
      const totalTimeSaved = last4Weeks.reduce((sum, item) => sum + item.timeSaved, 0);
      const totalValue = totalTimeSaved * 50; // $50/hour estimate
      
      // Calculate week-over-week growth
      const thisWeek = last4Weeks[last4Weeks.length - 1]?.documents || 0;
      const lastWeek = last4Weeks[last4Weeks.length - 2]?.documents || 0;
      const growth = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
      
      return {
        totalDocuments: totalDocs,
        totalTimeSaved: totalTimeSaved,
        totalValue: totalValue,
        growth: growth,
        period: 'Last 4 weeks'
      };
    } else {
      // Get last 12 months of data
      const last12Months = chartData.slice(-12);
      const totalDocs = last12Months.reduce((sum, item) => sum + item.documents, 0);
      const totalTimeSaved = last12Months.reduce((sum, item) => sum + item.timeSaved, 0);
      const totalValue = totalTimeSaved * 50; // $50/hour estimate
      
      return {
        totalDocuments: analytics.totalDocuments,
        totalTimeSaved: analytics.totalTimeSavedHours,
        totalValue: analytics.totalMoneySaved,
        growth: analytics.monthOverMonthGrowth,
        period: 'Last 12 months'
      };
    }
  };

  const filteredStats = getFilteredStats();

  // Document type breakdown (simulated categories)
  const categoryData = [
    { name: 'PDFs', value: Math.floor(analytics.totalDocuments * 0.65), color: '#F97316' },
    { name: 'Documents', value: Math.floor(analytics.totalDocuments * 0.25), color: '#10B981' },
    { name: 'Others', value: Math.floor(analytics.totalDocuments * 0.10), color: '#6366F1' },
  ];

  // Forecast data
  const forecastData = chartData.slice(-6).map((item, index) => ({
    month: item.month,
    actual: item.documents,
    forecast: item.documents * (1 + (index * 0.1)), // Simulated growth
  }));

  // Handle tab clicks - show modal for non-summary tabs
  const handleTabClick = (tab: string) => {
    if (tab === 'summary') {
      setActiveTab('summary');
      setShowModal(false);
      return;
    }

    const modalContents: { [key: string]: { title: string; description: string; icon: React.ReactNode } } = {
      documents: {
        title: 'Documents Analytics',
        description: `You have processed ${analytics?.totalDocuments || 0} documents in total. ${analytics?.docsThisMonth || 0} documents were processed this month.`,
        icon: <FileText className="w-12 h-12 text-blue-400" />
      },
      processing: {
        title: 'Processing Analytics',
        description: `Your processing success rate is ${analytics?.successRate || 0}%. You've processed ${formatNumber(analytics?.totalWordsProcessed || 0)} words across all documents.`,
        icon: <Activity className="w-12 h-12 text-purple-400" />
      },
      timeSaved: {
        title: 'Time Saved Analytics',
        description: `You've saved ${analytics?.totalTimeSavedHours >= 24 ? `${analytics.totalTimeSavedDays.toFixed(1)} days` : `${analytics?.totalTimeSavedHours.toFixed(1)} hours`} by using automated document processing instead of manual review.`,
        icon: <Clock className="w-12 h-12 text-orange-400" />
      },
      value: {
        title: 'Value Analytics',
        description: `The estimated value saved from automation is ${formatCurrency(analytics?.totalMoneySaved || 0)}. This is based on time saved and average hourly rates.`,
        icon: <DollarSign className="w-12 h-12 text-emerald-400" />
      }
    };

    setModalContent(modalContents[tab] || null);
    setShowModal(true);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="px-6 py-8 border-b border-gray-800/50"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Document analytics
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <button
                onClick={() => handleTabClick('summary')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'summary'
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => handleTabClick('documents')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'documents'
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => handleTabClick('processing')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'processing'
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => handleTabClick('timeSaved')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'timeSaved'
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Time Saved
              </button>
              <button
                onClick={() => handleTabClick('value')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'value'
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Value
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTimeFilter('weekly')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  timeFilter === 'weekly'
                    ? 'bg-gray-700 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeFilter('monthly')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  timeFilter === 'monthly'
                    ? 'bg-gray-700 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace('2024', '2025')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Processing Efficiency Dashboard */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Processing Efficiency</h3>
                  <Activity className="w-6 h-6 text-orange-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Success Rate */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Success Rate</span>
                      <span className="text-2xl font-bold text-white">{analytics.successRate}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.successRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {analytics.totalDocuments > 0 
                        ? `${analytics.totalDocuments} documents processed successfully`
                        : 'No documents processed yet'}
                    </p>
                  </div>

                  {/* Average Words Per Document */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Avg Words/Document</span>
                      <span className="text-2xl font-bold text-white">{formatNumber(analytics.avgWordsPerDocument)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Total Words</span>
                          <span className="text-white font-semibold">{formatNumber(analytics.totalWordsProcessed)}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                            style={{ width: `${Math.min((analytics.totalWordsProcessed / 100000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Processing Speed */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Processing Speed</span>
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Avg Time Saved</span>
                        <span className="text-lg font-bold text-white">
                          {analytics.totalDocuments > 0 
                            ? `${(analytics.totalTimeSavedHours / analytics.totalDocuments).toFixed(1)}h`
                            : '0h'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Per document vs manual review
                      </div>
                    </div>
                  </div>

                  {/* Growth Metrics */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">This Month</span>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Documents</span>
                        <span className="text-lg font-bold text-white">{analytics.docsThisMonth}</span>
                      </div>
                      {analytics.monthOverMonthGrowth !== 0 && (
                        <div className={`flex items-center gap-1 text-xs ${
                          analytics.monthOverMonthGrowth > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {analytics.monthOverMonthGrowth > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(analytics.monthOverMonthGrowth)}% vs last month
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-2">Key Insights</h4>
                      <ul className="space-y-1 text-xs text-gray-300">
                        {analytics.totalDocuments > 0 ? (
                          <>
                            <li>• You've processed <span className="font-semibold text-orange-400">{analytics.totalDocuments}</span> documents with {analytics.successRate}% success rate</li>
                            <li>• Saved approximately <span className="font-semibold text-emerald-400">{analytics.totalTimeSavedHours >= 24 ? `${analytics.totalTimeSavedDays.toFixed(1)} days` : `${analytics.totalTimeSavedHours.toFixed(1)} hours`}</span> of manual review time</li>
                            {analytics.docsThisWeek > 0 && (
                              <li>• <span className="font-semibold text-blue-400">{analytics.docsThisWeek}</span> documents processed this week</li>
                            )}
                          </>
                        ) : (
                          <li>Upload your first document to start tracking processing efficiency and insights</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Key Stats */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Total Documents */}
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-2">
                  {timeFilter === 'weekly' ? 'Documents (Last 4 weeks)' : 'Total Documents'}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-4xl font-bold text-white">
                    {filteredStats.totalDocuments.toLocaleString()}
                  </p>
                  {filteredStats.growth !== 0 && (
                    <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                      filteredStats.growth > 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {filteredStats.growth > 0 ? '+' : ''}{filteredStats.growth}%
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Total Time Saved */}
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-2">
                  {timeFilter === 'weekly' ? 'Time Saved (Last 4 weeks)' : 'Total Time Saved'}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-4xl font-bold text-white">
                    {timeFilter === 'weekly' 
                      ? filteredStats.totalTimeSaved.toFixed(1)
                      : filteredStats.totalTimeSaved >= 24 
                        ? `${(filteredStats.totalTimeSaved / 24).toFixed(1)}`
                        : `${filteredStats.totalTimeSaved.toFixed(1)}`
                    }
                    <span className="text-2xl text-gray-400 ml-1">
                      {timeFilter === 'weekly' 
                        ? 'hrs'
                        : filteredStats.totalTimeSaved >= 24 ? 'days' : 'hrs'
                      }
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Net Value */}
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-2">
                  {timeFilter === 'weekly' ? 'Value (Last 4 weeks)' : 'Total Net Value'}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-4xl font-bold text-white">
                    {formatCurrency(filteredStats.totalValue).replace('.00', '')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
      </div>

        {/* Bottom Three Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                  {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                    analytics.recentActivity.slice(0, 5).map((activity, index) => {
                      const date = new Date(activity.timestamp);
                      const timeAgo = formatDistanceToNow(date, { addSuffix: true });
                      const isRecent = (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours
                      
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors border border-gray-700/50"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            isRecent ? 'bg-emerald-400' : 'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{activity.action}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{timeAgo}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Processing Analysis with Pie Chart */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
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
                      <p className="text-4xl font-bold text-white">{analytics.totalDocuments}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-300">PDFs</span>
                    </div>
                    <span className="text-white font-semibold">65%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-300">Documents</span>
                    </div>
                    <span className="text-white font-semibold">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-gray-300">Others</span>
                    </div>
                    <span className="text-white font-semibold">10%</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Performance Forecast */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-6">Performance Forecast</h3>

                <div className="h-[200px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280"
                        fontSize={11}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={11}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '8px 12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="forecast" 
                        stroke="#EC4899" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#EC4899', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    Expecting <span className="font-semibold text-blue-400">growth in {forecastData[forecastData.length - 1]?.month}</span>. 
                    Consider <span className="font-semibold text-pink-400">expanding capacity</span> or optimizing current workflows.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && modalContent && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gray-800 border border-gray-700">
                {modalContent.icon}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {modalContent.title}
              </h2>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {modalContent.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowModal(false);
                  // Force navigation to dashboard - this will reload and show summaries tab by default
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 100);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
              >
                View Summary
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
