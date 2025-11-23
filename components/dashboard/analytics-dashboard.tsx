"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Clock, TrendingUp, CheckCircle, BarChart3, Activity, Zap, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
            <div key={i} className="h-32 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg">No analytics data available yet</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first document to see insights</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const userName = user?.fullName || user?.firstName || "User";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Hi {userName.split(' ')[0]}
        </h2>
        <p className="text-gray-400 text-lg">
          Here's your document analysis report for this month
        </p>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-700/50">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                {analytics.monthOverMonthGrowth !== 0 && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    analytics.monthOverMonthGrowth > 0
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}>
                    {analytics.monthOverMonthGrowth > 0 ? '+' : ''}{analytics.monthOverMonthGrowth}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">Total Documents</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.totalDocuments}</p>
              <p className="text-sm text-gray-500">{analytics.docsThisMonth} this month</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-700/50">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">Time Saved</p>
              <p className="text-3xl font-bold text-white mb-1">
                {analytics.totalTimeSavedHours >= 24 
                  ? `${analytics.totalTimeSavedDays.toFixed(1)}d`
                  : `${analytics.totalTimeSavedHours.toFixed(1)}h`
                }
              </p>
              <p className="text-sm text-gray-500">Automated processing</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-700/50">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">Money Saved</p>
              <p className="text-3xl font-bold text-white mb-1">
                ${formatNumber(analytics.totalMoneySaved)}
              </p>
              <p className="text-sm text-gray-500">Estimated value</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-700/50">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.successRate}%</p>
              <p className="text-sm text-gray-500">Completed documents</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Documents Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/20 border border-orange-500/20">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Documents Overview</h3>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Documents</p>
                  <p className="text-3xl font-bold text-white mb-1.5">{analytics.totalDocuments}</p>
                  <p className="text-sm text-gray-500">
                    {analytics.docsThisWeek} processed this week
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Words Processed</p>
                  <p className="text-3xl font-bold text-white mb-1.5">{formatNumber(analytics.totalWordsProcessed)}</p>
                  <p className="text-sm text-gray-500">
                    ~{formatNumber(analytics.avgWordsPerDocument)} words per document
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">This Month</p>
                  <p className="text-3xl font-bold text-white mb-1.5">{analytics.docsThisMonth}</p>
                  {analytics.docsLastMonth > 0 && (
                    <p className="text-sm text-gray-500">
                      {analytics.docsLastMonth} last month
                      {analytics.monthOverMonthGrowth !== 0 && (
                        <span className={`ml-2 ${
                          analytics.monthOverMonthGrowth > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          ({analytics.monthOverMonthGrowth > 0 ? '+' : ''}{analytics.monthOverMonthGrowth}%)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-300">Time Saved This Month</span>
                  </div>
                  {/* Progress Gauge */}
                  <div className="relative w-full h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 100">
                      {/* Background arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-gray-800"
                      />
                      {/* Progress arc - based on documents this month */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={`${Math.min((analytics.docsThisMonth / 50) * 502.65, 502.65)} 502.65`}
                        strokeLinecap="round"
                        className="text-orange-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {analytics.docsThisMonth > 0 
                            ? `${(analytics.docsThisMonth * 0.5).toFixed(1)}h`
                            : '0h'
                          }
                        </p>
                        <p className="text-sm text-gray-400">saved this month</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Total Value Saved</span>
                    <span className="text-xl font-bold text-emerald-400">
                      ${formatNumber(analytics.totalMoneySaved)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Based on automated processing vs manual review
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Over Time Line Chart */}
            {analytics.documentsOverTime.length > 0 && (
              <div className="h-56 bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
                <p className="text-sm font-medium text-gray-300 mb-3">Documents Over Time</p>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={analytics.documentsOverTime.map((item) => ({
                    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    documents: item.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="documents" 
                      stroke="#F97316"
                      strokeWidth={3}
                      dot={{ fill: '#F97316', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Document Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20 border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Document Analytics</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Document Activity Chart */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">Document Activity</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>&gt;10</span>
                      <span>&gt;50</span>
                      <span>&gt;100</span>
                    </div>
                  </div>
                  <div className="h-56 bg-gray-900/50 rounded-lg border border-gray-800/50 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.documentsOverTime.length > 0 ? analytics.documentsOverTime.map((item, idx) => ({
                        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        count: item.count
                      })) : [{ date: 'No Data', count: 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tick={{ fill: '#9CA3AF' }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tick={{ fill: '#9CA3AF' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#F97316"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Key Metrics Summary */}
              <div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-sm font-medium text-gray-300 mb-4">This Month Summary</p>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3.5 border border-gray-700/30">
                      <p className="text-sm text-gray-400 mb-1.5">Documents Processed</p>
                      <p className="text-2xl font-bold text-white mb-1">{analytics.docsThisMonth}</p>
                      {analytics.docsLastMonth > 0 && analytics.monthOverMonthGrowth !== 0 && (
                        <p className={`text-sm mt-1 ${
                          analytics.monthOverMonthGrowth > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {analytics.monthOverMonthGrowth > 0 ? '+' : ''}{analytics.monthOverMonthGrowth}% vs last month
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3.5 border border-gray-700/30">
                      <p className="text-sm text-gray-400 mb-1.5">Time Saved</p>
                      <p className="text-2xl font-bold text-emerald-400 mb-1">
                        {analytics.docsThisMonth > 0 
                          ? `${(analytics.docsThisMonth * 0.5).toFixed(1)} hours`
                          : '0 hours'
                        }
                      </p>
                      <p className="text-sm text-gray-500">This month</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg p-3.5 border border-orange-500/20">
                      <p className="text-sm text-gray-300 mb-1.5 font-medium">Value Saved</p>
                      <p className="text-2xl font-bold text-orange-400 mb-1">
                        ${analytics.docsThisMonth > 0 
                          ? formatNumber(Math.round(analytics.docsThisMonth * 0.5 * 50))
                          : '0'
                        }
                      </p>
                      <p className="text-sm text-gray-400">This month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Bottom Row: Recent Activity & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/20 border border-purple-500/20">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                </div>
                {analytics.recentActivity.length > 5 && (
                  <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    See all →
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.slice(0, 5).map((activity) => {
                    const date = new Date(activity.timestamp);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - date.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    
                    let timeAgo = '';
                    if (diffDays > 0) {
                      timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                    } else if (diffHours > 0) {
                      timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    } else if (diffMinutes > 0) {
                      timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                    } else {
                      timeAgo = 'Just now';
                    }

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {activity.title || 'Untitled Document'}
                            </p>
                            <p className="text-sm text-gray-500">{timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Processing Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/20 border border-blue-500/20">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Processing Stats</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-800/30 rounded-lg p-3.5 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-300">Documents This Week</span>
                    <span className="text-xl font-bold text-white">{analytics.docsThisWeek}</span>
                  </div>
                  <p className="text-sm text-gray-500">Processed in the last 7 days</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3.5 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-300">Average Words per Document</span>
                    <span className="text-xl font-bold text-white">{formatNumber(analytics.avgWordsPerDocument)}</span>
                  </div>
                  <p className="text-sm text-gray-500">Based on all processed documents</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3.5 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-300">Total Time Saved</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {analytics.totalTimeSavedHours >= 24 
                        ? `${analytics.totalTimeSavedDays.toFixed(1)} days`
                        : `${analytics.totalTimeSavedHours.toFixed(1)} hours`
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Compared to manual processing</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg p-3.5 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-300 font-medium">Total Value Saved</span>
                    <span className="text-2xl font-bold text-orange-400">
                      ${formatNumber(analytics.totalMoneySaved)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Estimated value from automation</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

