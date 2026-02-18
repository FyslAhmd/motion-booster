'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Eye,
  MousePointer,
  Users,
  Award,
  FileText,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const performanceData = [
    { date: 'Week 1', spend: 1250, revenue: 5200, clicks: 3200, impressions: 45000 },
    { date: 'Week 2', spend: 1480, revenue: 6100, clicks: 3800, impressions: 52000 },
    { date: 'Week 3', spend: 1320, revenue: 5850, clicks: 3500, impressions: 48000 },
    { date: 'Week 4', spend: 1680, revenue: 7200, clicks: 4100, impressions: 58000 },
  ];

  const campaignData = [
    { name: 'Summer Sale', value: 35, color: '#3b82f6' },
    { name: 'Brand Awareness', value: 25, color: '#8b5cf6' },
    { name: 'Product Launch', value: 20, color: '#10b981' },
    { name: 'Holiday Special', value: 15, color: '#f59e0b' },
    { name: 'Others', value: 5, color: '#6b7280' },
  ];

  const deviceData = [
    { device: 'Mobile', percentage: 55, clicks: 5200 },
    { device: 'Desktop', percentage: 35, clicks: 3300 },
    { device: 'Tablet', percentage: 10, clicks: 950 },
  ];

  const topPerformers = [
    { name: 'Summer Sale 2026', roas: 5.2, spend: 1245, status: 'up' },
    { name: 'Product Demo Video', roas: 4.8, spend: 856, status: 'up' },
    { name: 'Limited Time Offer', roas: 4.1, spend: 532, status: 'up' },
    { name: 'Brand Awareness', roas: 2.8, spend: 324, status: 'down' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">Comprehensive performance insights and metrics</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Report
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Select Dates
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">$24,350</div>
            <div className="text-sm text-gray-500 mt-2">vs. $21,645 last period</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+0.3x</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Average ROAS</div>
            <div className="text-3xl font-bold text-gray-900">4.2x</div>
            <div className="text-sm text-gray-500 mt-2">$4.20 per $1 spent</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-gray-900">14,600</div>
            <div className="text-sm text-gray-500 mt-2">CTR: 3.2%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15.3%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Impressions</div>
            <div className="text-3xl font-bold text-gray-900">203K</div>
            <div className="text-sm text-gray-500 mt-2">+26K from last period</div>
          </motion.div>
        </div>

        {/* Performance Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Performance Over Time</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('all')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedMetric === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedMetric === 'revenue' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('clicks')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedMetric === 'clicks' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Clicks
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
              <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" name="Spend ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={campaignData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {campaignData.map((campaign, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: campaign.color }}></div>
                  <span className="text-sm text-gray-600">{campaign.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Device Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Device Performance</h2>
            <div className="space-y-6">
              {deviceData.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        device.device === 'Mobile' ? 'bg-blue-100' :
                        device.device === 'Desktop' ? 'bg-purple-100' : 'bg-green-100'
                      }`}>
                        <Users className={`w-5 h-5 ${
                          device.device === 'Mobile' ? 'text-blue-600' :
                          device.device === 'Desktop' ? 'text-purple-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{device.device}</div>
                        <div className="text-sm text-gray-500">{device.clicks.toLocaleString()} clicks</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{device.percentage}%</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        device.device === 'Mobile' ? 'bg-blue-600' :
                        device.device === 'Desktop' ? 'bg-purple-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Performing Campaigns</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {topPerformers.map((campaign, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">Spend: ${campaign.spend.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{campaign.roas.toFixed(1)}x ROAS</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      campaign.status === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {campaign.status === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>Trending</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Report Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Monthly Performance</h3>
              <p className="text-sm text-gray-600">Complete overview of monthly metrics</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Campaign Analysis</h3>
              <p className="text-sm text-gray-600">Detailed campaign performance breakdown</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">ROI Report</h3>
              <p className="text-sm text-gray-600">Return on investment analysis</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
