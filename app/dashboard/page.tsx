'use client';

import { useAuth } from '@/lib/auth/context';
import { useState } from 'react';
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
  MousePointer,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');

  // Mock data based on Meta Marketing API structure
  const spendingData = [
    { date: 'Feb 1', spend: 78, impressions: 4200, clicks: 115 },
    { date: 'Feb 2', spend: 82, impressions: 4500, clicks: 122 },
    { date: 'Feb 3', spend: 75, impressions: 4100, clicks: 108 },
    { date: 'Feb 4', spend: 88, impressions: 4800, clicks: 132 },
    { date: 'Feb 5', spend: 92, impressions: 5100, clicks: 145 },
    { date: 'Feb 6', spend: 85, impressions: 4700, clicks: 128 },
    { date: 'Feb 7', spend: 80, impressions: 4400, clicks: 118 },
    { date: 'Feb 8', spend: 95, impressions: 5300, clicks: 152 },
    { date: 'Feb 9', spend: 87, impressions: 4900, clicks: 135 },
    { date: 'Feb 10', spend: 90, impressions: 5000, clicks: 142 },
    { date: 'Feb 11', spend: 83, impressions: 4600, clicks: 125 },
    { date: 'Feb 12', spend: 78, impressions: 4300, clicks: 116 },
    { date: 'Feb 13', spend: 85, impressions: 4700, clicks: 130 },
    { date: 'Feb 14', spend: 92, impressions: 5200, clicks: 148 },
    { date: 'Feb 15', spend: 88, impressions: 4900, clicks: 138 },
    { date: 'Feb 16', spend: 86, impressions: 4800, clicks: 133 },
    { date: 'Feb 17', spend: 90, impressions: 5000, clicks: 140 },
    { date: 'Feb 18', spend: 94, impressions: 5300, clicks: 150 },
    { date: 'Feb 19', spend: 87, impressions: 4800, clicks: 136 },
    { date: 'Feb 20', spend: 89, impressions: 4950, clicks: 141 },
  ];

  const campaigns = [
    { 
      id: 1, 
      name: 'Summer Sale 2026', 
      status: 'ACTIVE', 
      objective: 'CONVERSIONS',
      spend: 1245.50, 
      impressions: 125000, 
      clicks: 3400, 
      cpc: 0.366,
      ctr: 2.72,
      reach: 45000,
      frequency: 2.78,
      roas: 5.2,
      purchaseValue: 6476.60
    },
    { 
      id: 2, 
      name: 'Brand Awareness Q1', 
      status: 'ACTIVE', 
      objective: 'BRAND_AWARENESS',
      spend: 890.25, 
      impressions: 98000, 
      clicks: 2100, 
      cpc: 0.424,
      ctr: 2.14,
      reach: 35000,
      frequency: 2.80,
      roas: 3.8,
      purchaseValue: 3383.00
    },
    { 
      id: 3, 
      name: 'Product Launch Video', 
      status: 'ACTIVE', 
      objective: 'VIDEO_VIEWS',
      spend: 532.00, 
      impressions: 65000, 
      clicks: 1820, 
      cpc: 0.292,
      ctr: 2.80,
      reach: 28000,
      frequency: 2.32,
      roas: 4.1,
      purchaseValue: 2181.20
    },
    { 
      id: 4, 
      name: 'Retargeting Campaign', 
      status: 'PAUSED', 
      objective: 'CONVERSIONS',
      spend: 234.98, 
      impressions: 12400, 
      clicks: 890, 
      cpc: 0.264,
      ctr: 7.18,
      reach: 8500,
      frequency: 1.46,
      roas: 2.8,
      purchaseValue: 657.94
    },
    { 
      id: 5, 
      name: 'Holiday Special Offer', 
      status: 'ACTIVE', 
      objective: 'CONVERSIONS',
      spend: 324.00, 
      impressions: 28000, 
      clicks: 980, 
      cpc: 0.331,
      ctr: 3.50,
      reach: 15000,
      frequency: 1.87,
      roas: 5.3,
      purchaseValue: 1717.20
    },
  ];

  const topAds = [
    { 
      id: 'ad_456',
      name: 'Video Ad - Product Launch', 
      metric: '5.2x ROAS', 
      performance: 92,
      spend: 500.00,
      purchaseValue: 2600.00,
      thumbnailColor: 'from-red-500 to-rose-500'
    },
    { 
      id: 'ad_789',
      name: 'Carousel - Summer Collection', 
      metric: '4.8x ROAS', 
      performance: 88,
      spend: 425.00,
      purchaseValue: 2040.00,
      thumbnailColor: 'from-pink-500 to-rose-500'
    },
    { 
      id: 'ad_123',
      name: 'Single Image - Limited Offer', 
      metric: '4.1x ROAS', 
      performance: 85,
      spend: 380.00,
      purchaseValue: 1558.00,
      thumbnailColor: 'from-orange-400 to-amber-500'
    },
    { 
      id: 'ad_321',
      name: 'Story Ad - New Arrivals', 
      metric: '3.8x ROAS', 
      performance: 78,
      spend: 295.00,
      purchaseValue: 1121.00,
      thumbnailColor: 'from-orange-500 to-red-500'
    },
    { 
      id: 'ad_654',
      name: 'Collection Ad - Best Sellers', 
      metric: '3.2x ROAS', 
      performance: 72,
      spend: 250.00,
      purchaseValue: 800.00,
      thumbnailColor: 'from-rose-500 to-red-400'
    },
  ];

  const activities = [
    { icon: MessageSquare, text: 'New message from Sarah (Agency)', time: '5 minutes ago', color: 'text-red-500' },
    { icon: TrendingUp, text: 'Campaign Summer Sale spent $250 today', time: '2 hours ago', color: 'text-orange-500' },
    { icon: FolderOpen, text: 'New report uploaded: Monthly_Performance.pdf', time: 'Yesterday', color: 'text-rose-500' },
    { icon: Bell, text: 'Budget alert: Campaign reaching limit', time: '2 days ago', color: 'text-orange-600' },
  ];

  // Audience Insights Data (from Meta API breakdowns)
  const ageData = [
    { name: '18-24', value: 35, color: '#10b981' },
    { name: '25-34', value: 45, color: '#8b5cf6' },
    { name: '35-44', value: 15, color: '#06b6d4' },
    { name: '45+', value: 5, color: '#f59e0b' },
  ];

  const genderData = [
    { name: 'Female', value: 60, color: '#8b5cf6' },
    { name: 'Male', value: 40, color: '#10b981' },
  ];

  // Placement Performance Data (from Meta API publisher_platform breakdown)
  const placementData = [
    { 
      name: 'Facebook', 
      spend: 1200.00, 
      impressions: 120000, 
      clicks: 3200,
      percentage: 49,
      color: '#10b981'
    },
    { 
      name: 'Instagram', 
      spend: 800.00, 
      impressions: 95000, 
      clicks: 2800,
      percentage: 33,
      color: '#8b5cf6'
    },
    { 
      name: 'Audience Network', 
      spend: 456.78, 
      impressions: 50000, 
      clicks: 1100,
      percentage: 18,
      color: '#06b6d4'
    },
  ];

  // Conversion Funnel Data (from Meta API actions breakdown)
  const conversionFunnel = [
    { stage: 'Impressions', value: 125000, percentage: 100 },
    { stage: 'Clicks', value: 3425, percentage: 2.74 },
    { stage: 'Landing Page Views', value: 2890, percentage: 84.38 },
    { stage: 'Add to Cart', value: 420, percentage: 14.53 },
    { stage: 'Purchases', value: 145, percentage: 34.52 },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
        {/* Welcome Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent flex-1 sm:flex-none"
                >
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
                <button className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Ad Spend */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/70 transition-all"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-red-500">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>12.5%</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Spend</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">$2,456.78</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">+$274.50 from last period</div>
            </div>

            {/* Card 2: Impressions */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/70 transition-all"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>8.2%</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Impressions</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">125.3K</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">+8.2% vs last period</div>
            </div>

            {/* Card 3: Link Clicks */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/70 transition-all"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <MousePointer className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>15.3%</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Link Clicks</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">3,425</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">2.73% CTR</div>
            </div>

            {/* Card 4: ROAS */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/70 transition-all"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-red-500">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+0.5x</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Return on Ad Spend</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">4.2x</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">$4.20 earned per $1 spent</div>
            </div>
          </div>

          {/* Spending Trend Chart */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ad Spending Over Time</h2>
              <div className="flex gap-2">
              <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-50 text-red-500 rounded-lg font-medium">Day</button>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Week</button>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Month</button>
              </div>
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}
                  formatter={(value: any, name?: string) => {
                    if (name === 'spend') return [`$${value}`, 'Spend'];
                    if (name === 'impressions') return [value.toLocaleString(), 'Impressions'];
                    if (name === 'clicks') return [value, 'Clicks'];
                    return [value, name || ''];
                  }}
                />
                <Area type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Performance (Left - 2 columns) */}
            <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Campaign Performance</h2>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="">
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
                      <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{campaign.name}</div>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                              campaign.status === 'ACTIVE' 
                                ? 'bg-red-50 text-red-600' 
                                : campaign.status === 'PAUSED'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              🟢 {campaign.status === 'ACTIVE' ? 'Active' : campaign.status === 'PAUSED' ? '🟡 Paused' : 'Completed'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">${campaign.spend.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600">{(campaign.impressions / 1000).toFixed(1)}K</td>
                        <td className="py-3 px-4 text-gray-600">{(campaign.clicks / 1000).toFixed(1)}K</td>
                        <td className="py-3 px-4 text-gray-600">${campaign.cpc.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="text-red-500 font-medium">{campaign.roas.toFixed(1)}x</span>
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
            </div>

            {/* Right Column: Two Stacked Cards */}
            <div className="space-y-6">
              {/* Top Performing Ads */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Best Performing Ads</h3>
                <div className="space-y-3">
                  {topAds.map((ad, index) => (
                    <div key={ad.id} className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br ${ad.thumbnailColor} rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{ad.name}</div>
                        <div className="text-xs text-green-600 font-medium">{ad.metric}</div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-red-500 h-1.5 rounded-full" 
                            style={{ width: `${ad.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-red-500 hover:text-red-600 font-medium">
                  View All Ads →
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6"
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
                <button className="w-full mt-4 text-sm text-red-500 hover:text-red-600 font-medium">
                  View All Activity →
                </button>
              </div>
            </div>
          </div>

          {/* Audience Insights & Placement Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audience Insights */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Audience Insights</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Age Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Age Distribution</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {ageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {ageData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Gender Distribution</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {genderData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Placement Performance */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Placement Performance</h2>
              
              <div className="h-[250px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placementData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6b7280" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={100} />
                    <Tooltip 
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}
                      formatter={(value: any) => [`$${value}`, 'Spend']}
                    />
                    <Bar dataKey="spend" radius={[0, 8, 8, 0]}>
                      {placementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {placementData.map((placement, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: placement.color + '20' }}>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: placement.color }}></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{placement.name}</div>
                        <div className="text-xs text-gray-500">{placement.clicks.toLocaleString()} clicks</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">${placement.spend.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{placement.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Conversion Funnel</h2>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Revenue: </span>
                  <span className="font-bold text-red-500">$10,350.45</span>
                </div>
                <div>
                  <span className="text-gray-600">Cost Per Purchase: </span>
                  <span className="font-bold text-gray-900">$16.94</span>
                </div>
                <div>
                  <span className="text-gray-600">ROAS: </span>
                  <span className="font-bold text-red-500">4.2x</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-rose-500' :
                        index === 2 ? 'bg-orange-500' :
                        index === 3 ? 'bg-amber-500' :
                        'bg-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stage.stage}</div>
                        <div className="text-xs text-gray-500">
                          {stage.value.toLocaleString()} {index > 0 && `(${stage.percentage.toFixed(2)}% conversion)`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{stage.value.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-rose-500' :
                        index === 2 ? 'bg-orange-500' :
                        index === 3 ? 'bg-amber-500' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${index === 0 ? 100 : (stage.value / conversionFunnel[0].value) * 100}%` }}
                    ></div>
                  </div>
                  {index < conversionFunnel.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowDown className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
          >
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Connect Ad Account</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Add another Meta Ads account</p>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 w-full text-sm font-medium">
                Connect
              </button>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Message Agency</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Have questions? Chat with us</p>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 w-full text-sm font-medium">
                Start Chat
              </button>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <FileDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Export Report</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Download your data as PDF/CSV</p>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 w-full text-sm font-medium">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
