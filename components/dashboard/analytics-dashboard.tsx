"use client";

import { useEffect, useState } from "react";
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
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

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
  const { user } = useUser();

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

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
              Welcome back, {userName.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Here's your comprehensive analytics overview
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium text-gray-300">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards - Redesigned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent hover:from-blue-500/15 hover:via-blue-600/10 transition-all duration-300 shadow-lg shadow-blue-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                {analytics.monthOverMonthGrowth !== 0 && (
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    analytics.monthOverMonthGrowth > 0
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {analytics.monthOverMonthGrowth > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{Math.abs(analytics.monthOverMonthGrowth)}%</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400">Total Documents</p>
                <p className="text-4xl font-bold text-white">{analytics.totalDocuments}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  {analytics.docsThisMonth} this month
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent hover:from-orange-500/15 hover:via-orange-600/10 transition-all duration-300 shadow-lg shadow-orange-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400">Time Saved</p>
                <p className="text-4xl font-bold text-white">
                  {analytics.totalTimeSavedHours >= 24 
                    ? `${analytics.totalTimeSavedDays.toFixed(1)}d`
                    : `${analytics.totalTimeSavedHours.toFixed(1)}h`
                  }
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  Automated processing
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent hover:from-emerald-500/15 hover:via-emerald-600/10 transition-all duration-300 shadow-lg shadow-emerald-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400">Money Saved</p>
                <p className="text-4xl font-bold text-white">
                  {formatCurrency(analytics.totalMoneySaved).replace('.00', '')}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Estimated value
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent hover:from-purple-500/15 hover:via-purple-600/10 transition-all duration-300 shadow-lg shadow-purple-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400">Success Rate</p>
                <p className="text-4xl font-bold text-white">{analytics.successRate}%</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  Completed documents
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Documents Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-50" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Documents Overview</h3>
                    <p className="text-sm text-gray-400">Complete processing statistics</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
                  <p className="text-xs font-medium text-gray-400 mb-2">Total Documents</p>
                  <p className="text-3xl font-bold text-white mb-1">{analytics.totalDocuments}</p>
                  <p className="text-xs text-gray-500">{analytics.docsThisWeek} this week</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
                  <p className="text-xs font-medium text-gray-400 mb-2">Words Processed</p>
                  <p className="text-3xl font-bold text-white mb-1">{formatNumber(analytics.totalWordsProcessed)}</p>
                  <p className="text-xs text-gray-500">~{formatNumber(analytics.avgWordsPerDocument)} avg</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
                  <p className="text-xs font-medium text-gray-400 mb-2">This Month</p>
                  <p className="text-3xl font-bold text-white mb-1">{analytics.docsThisMonth}</p>
                  {analytics.docsLastMonth > 0 && analytics.monthOverMonthGrowth !== 0 && (
                    <p className={`text-xs flex items-center gap-1 ${
                      analytics.monthOverMonthGrowth > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {analytics.monthOverMonthGrowth > 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(analytics.monthOverMonthGrowth)}% vs last month
                    </p>
                  )}
                </div>
              </div>

              {/* Chart */}
              {analytics.documentsOverTime.length > 0 && (
                <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-gray-300 mb-4">Documents Over Time (Last 30 Days)</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.documentsOverTime.map((item) => ({
                        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        documents: item.count
                      }))}>
                        <defs>
                          <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
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
                        <Area 
                          type="monotone" 
                          dataKey="documents" 
                          stroke="#F97316"
                          strokeWidth={2}
                          fill="url(#colorDocuments)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Right Column - Performance Metrics */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Time & Value Saved Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-orange-500/5 opacity-50" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Performance</h3>
                  <p className="text-xs text-gray-400">This month</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Time Saved</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {analytics.docsThisMonth > 0 
                        ? `${(analytics.docsThisMonth * 0.5).toFixed(1)}h`
                        : '0h'
                      }
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((analytics.docsThisMonth / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">Value Saved</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {formatCurrency(analytics.docsThisMonth > 0 
                        ? Math.round(analytics.docsThisMonth * 0.5 * 50)
                        : 0
                      ).replace('.00', '')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Based on automated processing</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Quick Stats</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <span className="text-sm text-gray-400">This Week</span>
                  <span className="text-lg font-bold text-white">{analytics.docsThisWeek}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <span className="text-sm text-gray-400">Avg Words/Doc</span>
                  <span className="text-lg font-bold text-white">{formatNumber(analytics.avgWordsPerDocument)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <span className="text-sm font-medium text-gray-300">Total Value</span>
                  <span className="text-xl font-bold text-orange-400">
                    {formatCurrency(analytics.totalMoneySaved).replace('.00', '')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section - Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-50" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    <p className="text-xs text-gray-400">Latest document uploads</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.slice(0, 6).map((activity, index) => {
                    const date = new Date(activity.timestamp);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - date.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    
                    let timeAgo = '';
                    if (diffDays > 0) {
                      timeAgo = `${diffDays}d ago`;
                    } else if (diffHours > 0) {
                      timeAgo = `${diffHours}h ago`;
                    } else if (diffMinutes > 0) {
                      timeAgo = `${diffMinutes}m ago`;
                    } else {
                      timeAgo = 'Just now';
                    }

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 hover:bg-gray-800/70 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate mb-1">
                            {activity.title || 'Untitled Document'}
                          </p>
                          <p className="text-xs text-gray-500">{timeAgo}</p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Processing Insights */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 opacity-50" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Processing Insights</h3>
                    <p className="text-xs text-gray-400">Key performance metrics</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Total Time Saved</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {analytics.totalTimeSavedHours >= 24 
                        ? `${analytics.totalTimeSavedDays.toFixed(1)} days`
                        : `${analytics.totalTimeSavedHours.toFixed(1)} hours`
                      }
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${Math.min((analytics.totalTimeSavedHours / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Compared to manual processing</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Total Value Saved</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {formatCurrency(analytics.totalMoneySaved).replace('.00', '')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Estimated value from automation</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-400 mb-1">This Week</p>
                    <p className="text-xl font-bold text-white">{analytics.docsThisWeek}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-400 mb-1">Avg Words</p>
                    <p className="text-xl font-bold text-white">{formatNumber(analytics.avgWordsPerDocument)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
