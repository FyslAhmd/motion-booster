'use client';

import { useMemo } from 'react';
import { Users, Briefcase, MessageSquare, HelpCircle, BarChart2, Layers, MessageCircle, Phone, Mail } from 'lucide-react';
import AdminShell from './_components/AdminShell';
import MetaOverviewSection from './_components/MetaOverviewSection';
import { useAuth } from '@/lib/auth/context';
import { useSiteData } from '@/lib/admin/context';
import { AdminStore } from '@/lib/admin/store';
import Link from 'next/link';
import Image from 'next/image';

function UserOverview() {
  const { user } = useAuth();
  const settings = useMemo(() => AdminStore.getSettings(), []);
  const userName = user?.fullName || user?.username || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-full bg-gray-50 pb-24">
      {/* Profile header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{userName}</h2>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">Client</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/chat"
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Messages</p>
              <p className="text-[11px] text-gray-400 truncate">Open inbox</p>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Profile</p>
              <p className="text-[11px] text-gray-400 truncate">Edit account</p>
            </div>
          </Link>
        </div>

        {/* Contact */}
        {(settings.contactEmail || settings.contactPhone) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Need help?</p>
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-red-600 transition-colors">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{settings.contactEmail}</span>
              </a>
            )}
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-red-600 transition-colors">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{settings.contactPhone}</span>
              </a>
            )}
          </div>
        )}

        {/* Branding */}
        <div className="flex justify-center pt-2">
          <Image src="/Motion Booster Black Logo-01.svg" alt="Motion Booster" width={100} height={30} className="h-6 w-auto opacity-30" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { team, services, faqs, testimonials } = useSiteData();
  const portfolio = useMemo(() => AdminStore.getPortfolio(), []);
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <AdminShell>
        <UserOverview />
      </AdminShell>
    );
  }

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
                  Welcome back, {userName}! 👋
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
