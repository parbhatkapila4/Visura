"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Clock, TrendingUp, CheckCircle, BarChart3, Activity, ArrowUpRight, Sparkles, Zap, Users, Target, Calendar, Filter, Grid, MoreVertical, Eye, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsData {
  totalDocuments: number;
  totalWordsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  documentsOverTime: Array<{ date: string; count: number }>;
  recentActivity: Array<{ id: string; action: string; timestamp: string }>;
}

export default function AnalyticsDashboard({ userId }: { userId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("All");
  const [timeRange, setTimeRange] = useState("Monthly");
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
  const documentsGoal = 100;
  const goalPercentage = Math.min((analytics.totalDocuments / documentsGoal) * 100, 100);

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

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-black/40 border border-gray-700/50">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  +30%
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Total Documents</p>
              <p className="text-3xl font-bold text-white">{analytics.totalDocuments}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-black/40 border border-gray-700/50">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                  -3%
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Words Processed</p>
              <p className="text-3xl font-bold text-white">{formatNumber(analytics.totalWordsProcessed)}</p>
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
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/20">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Documents Overview</h3>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Number of Documents</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalDocuments}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-semibold">3.9%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Words</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalWordsProcessed)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-semibold">4.9%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Documents Goal</span>
                    <span className="text-sm font-semibold text-white">{goalPercentage.toFixed(1)}%</span>
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
                      {/* Progress arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={`${(goalPercentage / 100) * 502.65} 502.65`}
                        strokeLinecap="round"
                        className="text-orange-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{analytics.totalDocuments}</p>
                        <p className="text-xs text-gray-400">of {documentsGoal}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Your document volume has increased</span>
                  <span className="text-sm font-semibold">+10%</span>
                </div>
              </div>
            </div>

            {/* Documents Over Time Line Chart */}
            {analytics.documentsOverTime.length > 0 && (
              <div className="h-64 bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
                <p className="text-sm font-medium text-gray-300 mb-4">Documents Over Time</p>
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
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Document Analytics</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent text-sm text-white border-none outline-none cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
                <button className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                  <Grid className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Store Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {["All", "Recent", "Shared", "Archived"].map((store) => (
                <button
                  key={store}
                  onClick={() => setSelectedStore(store)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStore === store
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50"
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Activity Chart */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-300">Document Activity</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>&gt;10</span>
                      <span>&gt;50</span>
                      <span>&gt;100</span>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-900/50 rounded-lg border border-gray-800/50 p-4">
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

              {/* Growth Donut Chart */}
              <div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-sm font-medium text-gray-300 mb-4">Growth Rate</p>
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Growth', value: analytics.successRate },
                            { name: 'Remaining', value: 100 - analytics.successRate }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill="#F97316" />
                          <Cell fill="#374151" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">+{analytics.successRate}%</p>
                    <p className="text-xs text-gray-400 mb-1">Growth</p>
                    <p className="text-lg font-semibold text-white mb-1">{analytics.totalDocuments}</p>
                    <p className="text-sm text-gray-400 mb-3">Total Documents</p>
                    <button className="w-full px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                      View Details
                    </button>
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/20">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                </div>
                <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                  See all →
                </button>
              </div>
              <div className="space-y-4">
                {analytics.recentActivity.slice(0, 3).map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {index === 0 ? "01 Day Ago" : index === 1 ? "02 Days Ago" : "03 Days Ago"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">+ {analytics.totalDocuments}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Engagement Rate */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/20">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Engagement Rate</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimeRange("Monthly")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === "Monthly"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-gray-800/50 text-gray-400 border border-gray-700/50"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeRange("Annually")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === "Annually"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-gray-800/50 text-gray-400 border border-gray-700/50"
                    }`}
                  >
                    Annually
                  </button>
                </div>
              </div>
              <div className="h-64 bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={timeRange === "Monthly" 
                      ? [
                          { month: 'Jan', engagement: 8.2 },
                          { month: 'Feb', engagement: 7.5 },
                          { month: 'Mar', engagement: 9.1 },
                          { month: 'Apr', engagement: 8.8 },
                          { month: 'May', engagement: 10.5 },
                          { month: 'Jun', engagement: 9.8 },
                          { month: 'Jul', engagement: 11.2 },
                        ]
                      : [
                          { year: '2020', engagement: 8.5 },
                          { year: '2021', engagement: 9.2 },
                          { year: '2022', engagement: 9.8 },
                          { year: '2023', engagement: 10.1 },
                          { year: '2024', engagement: 10.5 },
                        ]
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey={timeRange === "Monthly" ? "month" : "year"}
                      stroke="#9CA3AF"
                      fontSize={12}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tick={{ fill: '#9CA3AF' }}
                      domain={[0, 12]}
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
                      dataKey="engagement" 
                      fill="#10B981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
