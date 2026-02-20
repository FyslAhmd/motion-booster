'use client';

import { useAuth } from '@/lib/auth/context';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FolderOpen,
  DollarSign,
  Target,
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  MoreVertical,
  Search,
  Link as LinkIcon,
  FileDown,
  ArrowUp,
  ArrowDown,
  Bell,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState('Last 7 Days');

  // Mock data for the dashboard
  const spendingData = [
    { date: 'Mon', spend: 245, budget: 300 },
    { date: 'Tue', spend: 312, budget: 300 },
    { date: 'Wed', spend: 198, budget: 300 },
    { date: 'Thu', spend: 456, budget: 300 },
    { date: 'Fri', spend: 389, budget: 300 },
    { date: 'Sat', spend: 421, budget: 300 },
    { date: 'Sun', spend: 435, budget: 300 },
  ];

  const campaigns = [
    { id: 1, name: 'Summer Sale 2026', status: 'Active', spend: 1245.50, impressions: 45200, clicks: 3420, cpc: 0.36, roas: 4.2 },
    { id: 2, name: 'New Product Launch', status: 'Active', spend: 856.30, impressions: 32100, clicks: 2180, cpc: 0.39, roas: 3.8 },
    { id: 3, name: 'Brand Awareness', status: 'Paused', spend: 234.98, impressions: 12400, clicks: 890, cpc: 0.26, roas: 2.1 },
    { id: 4, name: 'Holiday Special', status: 'Active', spend: 120.00, impressions: 8500, clicks: 612, cpc: 0.20, roas: 5.3 },
  ];

  const topAds = [
    { name: 'Product Demo Video', metric: '5.2x ROAS', performance: 92 },
    { name: 'Limited Time Offer', metric: '3.8K Clicks', performance: 78 },
    { name: 'Customer Testimonial', metric: '4.1x ROAS', performance: 85 },
    { name: 'Feature Highlight', metric: '2.9K Clicks', performance: 65 },
    { name: 'Brand Story', metric: '3.2x ROAS', performance: 72 },
  ];

  const activities = [
    { icon: MessageSquare, text: 'New message from Sarah (Agency)', time: '5 minutes ago', color: 'text-blue-600' },
    { icon: TrendingUp, text: 'Campaign Summer Sale spent $250 today', time: '2 hours ago', color: 'text-green-600' },
    { icon: FolderOpen, text: 'New report uploaded: Monthly_Performance.pdf', time: 'Yesterday', color: 'text-purple-600' },
    { icon: Bell, text: 'Budget alert: Campaign reaching limit', time: '2 days ago', color: 'text-orange-600' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
        {/* Welcome Header */}
        <div className="bg-linear-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="block sm:inline sm:ml-4 text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">Data synced: 10 min ago</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-none"
                >
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Spend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>12.5%</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Spend</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">$2,456.78</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">+$274.50 from last period</div>
            </motion.div>

            {/* Card 2: Active Campaigns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="text-xs sm:text-sm text-blue-600">+2 new</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Active Campaigns</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">8</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">2 paused</div>
            </motion.div>

            {/* Card 3: Average CPC */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                  <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>15%</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Avg. Cost Per Click</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">$0.85</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">Improved efficiency</div>
            </motion.div>

            {/* Card 4: ROAS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+0.5x</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Return on Ad Spend</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">4.2x</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">$4.20 earned per $1 spent</div>
            </motion.div>
          </div>

          {/* Spending Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ad Spending Over Time</h2>
              <div className="flex gap-2">
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-lg font-medium">Day</button>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Week</button>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Month</button>
              </div>
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                <Line type="monotone" dataKey="budget" stroke="#9ca3af" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Performance (Left - 2 columns) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Campaign Performance</h2>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Spend</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Impressions</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Clicks</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">CPC</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ROAS</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{campaign.name}</div>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                              campaign.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">${campaign.spend.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600">{(campaign.impressions / 1000).toFixed(1)}K</td>
                        <td className="py-3 px-4 text-gray-600">{(campaign.clicks / 1000).toFixed(1)}K</td>
                        <td className="py-3 px-4 text-gray-600">${campaign.cpc.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="text-green-600 font-medium">{campaign.roas.toFixed(1)}x</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Right Column: Two Stacked Cards */}
            <div className="space-y-6">
              {/* Top Performing Ads */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Best Performing Ads</h3>
                <div className="space-y-3">
                  {topAds.map((ad, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-400 to-purple-400 rounded-lg shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{ad.name}</div>
                        <div className="text-xs text-blue-600 font-medium">{ad.metric}</div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${ad.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Ads →
                </button>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Activity →
                </button>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
          >
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Connect Ad Account</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Add another Meta Ads account</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full text-sm font-medium">
                Connect
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 hover:border-green-200 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Message Agency</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Have questions? Chat with us</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full text-sm font-medium">
                Start Chat
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <FileDown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Export Report</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Download your data as PDF/CSV</p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full text-sm font-medium">
                Export
              </button>
            </div>
          </motion.div>
        </div>
      </div>
  );
}
