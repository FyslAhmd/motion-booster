'use client';

import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DashboardPreview = () => {
  // Sample data for charts
  const spendingData = [
    { month: 'Jan', spent: 4500, target: 4000 },
    { month: 'Feb', spent: 5200, target: 5000 },
    { month: 'Mar', spent: 4800, target: 5000 },
    { month: 'Apr', spent: 6300, target: 6000 },
    { month: 'May', spent: 5900, target: 6000 },
    { month: 'Jun', spent: 7100, target: 7000 },
  ];

  const performanceData = [
    { day: 'Mon', clicks: 320, conversions: 45 },
    { day: 'Tue', clicks: 450, conversions: 62 },
    { day: 'Wed', clicks: 380, conversions: 51 },
    { day: 'Thu', clicks: 520, conversions: 73 },
    { day: 'Fri', clicks: 490, conversions: 68 },
    { day: 'Sat', clicks: 410, conversions: 55 },
    { day: 'Sun', clicks: 380, conversions: 48 },
  ];

  const statsData = [
    { label: 'Total Spend', value: '$34,500', change: '+12.5%', color: 'blue' },
    { label: 'Active Campaigns', value: '24', change: '+3', color: 'green' },
    { label: 'Avg. ROI', value: '3.8x', change: '+0.4x', color: 'purple' },
  ];

  const campaigns = [
    { name: 'Summer Sale', budget: 8500, status: 'Active' },
    { name: 'Brand Awareness', budget: 6200, status: 'Active' },
    { name: 'Product Launch', budget: 4800, status: 'Paused' },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            See Your Data Come to Life
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            A dashboard that your clients will love to check every day
          </p>
        </div>

        {/* Dashboard Screenshot */}
        <div className="relative">
          {/* Main Dashboard Image */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white p-3 sm:p-4 lg:p-6">
            <div className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-linear-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 animate-pulse rounded-2xl"></div>
              
              {/* Dashboard Content */}
              <div className="relative z-10">
                {/* Top Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                  {statsData.map((stat, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          stat.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <div className={`text-2xl sm:text-3xl font-bold ${
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        'text-purple-600'
                      }`}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Bar Chart - Monthly Spending */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-md">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Monthly Ad Spending</h3>
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="spent" radius={[8, 8, 0, 0]}>
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 10}, 70%, 60%)`} />
                          ))}
                        </Bar>
                        <Bar dataKey="target" fill="#e5e7eb" radius={[8, 8, 0, 0]} opacity={0.5} />
                      </BarChart>
                    </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Area Chart - Performance */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-md">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Weekly Performance</h3>
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
                        <Area type="monotone" dataKey="conversions" stroke="#10b981" fillOpacity={1} fill="url(#colorConversions)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Campaign Table */}
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-md">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Active Campaigns</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {campaigns.map((campaign, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{campaign.name}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <span className="text-xs sm:text-sm text-gray-600">${campaign.budget.toLocaleString()}</span>
                          <span className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
                            campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Callout Annotations */}
          <div className="hidden lg:block">
            {/* Real-time spending data - Top Left */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500 animate-pulse">
              <p className="text-sm font-semibold text-gray-900">Real-time spending data</p>
            </div>

            {/* Campaign breakdown - Top Right */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-green-500 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm font-semibold text-gray-900">Campaign breakdown</p>
            </div>

            {/* Performance charts - Bottom Left */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-purple-500 animate-pulse" style={{ animationDelay: '1s' }}>
              <p className="text-sm font-semibold text-gray-900">Performance charts</p>
            </div>

            {/* Export reports - Bottom Right */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-orange-500 animate-pulse" style={{ animationDelay: '1.5s' }}>
              <p className="text-sm font-semibold text-gray-900">Export reports</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
