'use client';

import { useMemo } from 'react';
import { Users, Briefcase, MessageSquare, HelpCircle, BarChart2, Layers } from 'lucide-react';
import AdminShell from './_components/AdminShell';
import MetaOverviewSection from './_components/MetaOverviewSection';
import { useAuth } from '@/lib/auth/context';
import { useSiteData } from '@/lib/admin/context';
import { AdminStore } from '@/lib/admin/store';

export default function DashboardPage() {
  const { user } = useAuth();
  const { team, services, faqs, testimonials } = useSiteData();
  const portfolio = useMemo(() => AdminStore.getPortfolio(), []);

  const statCards = [
    { label: 'Team Members', value: team.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Portfolio Items', value: portfolio.length, icon: Briefcase, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Services', value: services.length, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Testimonials', value: testimonials.length, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'FAQs', value: faqs.length, icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <AdminShell>
      <div className="h-full overflow-y-auto bg-gray-50">
        {/* Welcome Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  <span className="hidden sm:inline">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="sm:hidden">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <BarChart2 className="h-4 w-4" />
                <span>Overview Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          {/* Meta Ads Performance Overview */}
          <MetaOverviewSection />
        </div>
      </div>
    </AdminShell>
  );
}
