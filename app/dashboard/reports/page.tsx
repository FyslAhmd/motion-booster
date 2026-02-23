'use client';

import { useState } from 'react';
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
    { name: 'Summer Sale', value: 35, color: '#ef4444' },
    { name: 'Brand Awareness', value: 25, color: '#f87171' },
    { name: 'Product Launch', value: 20, color: '#fb923c' },
    { name: 'Holiday Special', value: 15, color: '#fbbf24' },
    { name: 'Others', value: 5, color: '#9ca3af' },
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
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">Comprehensive performance insights and metrics</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 hover:bg-white/70 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-red-500">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">$24,350</div>
            <div className="text-sm text-gray-500 mt-2">vs. $21,645 last period</div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 hover:bg-white/70 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-red-500">
                <TrendingUp className="w-4 h-4" />
                <span>+0.3x</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Average ROAS</div>
            <div className="text-3xl font-bold text-gray-900">4.2x</div>
            <div className="text-sm text-gray-500 mt-2">$4.20 per $1 spent</div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 hover:bg-white/70 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-red-500">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-gray-900">14,600</div>
            <div className="text-sm text-gray-500 mt-2">CTR: 3.2%</div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 hover:bg-white/70 transition-all"
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
          </div>
        </div>

        {/* Performance Over Time */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Performance Over Time</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('all')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedMetric === 'all' ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedMetric === 'revenue' ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('clicks')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedMetric === 'clicks' ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-50'
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
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
              <Area type="monotone" dataKey="spend" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" name="Spend ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Distribution */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6"
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
          </div>

          {/* Device Performance */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Device Performance</h2>
            <div className="space-y-6">
              {deviceData.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        device.device === 'Mobile' ? 'bg-red-100' :
                        device.device === 'Desktop' ? 'bg-rose-100' : 'bg-orange-100'
                      }`}>
                        <Users className={`w-5 h-5 ${
                          device.device === 'Mobile' ? 'text-red-500' :
                          device.device === 'Desktop' ? 'text-rose-500' : 'text-orange-500'
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
                        device.device === 'Mobile' ? 'bg-red-500' :
                        device.device === 'Desktop' ? 'bg-rose-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Performing Campaigns</h2>
            <button className="text-sm text-red-500 hover:text-red-600 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {topPerformers.map((campaign, index) => (
              <div key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">Spend: ${campaign.spend.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-500">{campaign.roas.toFixed(1)}x ROAS</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      campaign.status === 'up' ? 'text-red-500' : 'text-gray-500'
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
              </div>
            ))}
          </div>
        </div>

        {/* Report Templates */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Monthly Performance</h3>
              <p className="text-sm text-gray-600">Complete overview of monthly metrics</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Campaign Analysis</h3>
              <p className="text-sm text-gray-600">Detailed campaign performance breakdown</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                <PieChart className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">ROI Report</h3>
              <p className="text-sm text-gray-600">Return on investment analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
