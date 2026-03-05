'use client';

import { useMemo, useState, useEffect } from 'react';
import { Users, Briefcase, BarChart2, Layers, MessageCircle, UserCheck, BellDot, TrendingUp } from 'lucide-react';
import AdminShell from './_components/AdminShell';
import MetaOverviewSection from './_components/MetaOverviewSection';
import { useAuth } from '@/lib/auth/context';
import { useSiteData } from '@/lib/admin/context';
import { AdminStore } from '@/lib/admin/store';
import { Slider, SlideData } from '@/components/ui';
import Link from 'next/link';

function PromoSlider() {
  const [slides, setSlides] = useState<SlideData[]>([]);

  useEffect(() => {
    fetch('/api/v1/cms/hero-slides')
      .then(r => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setSlides(data.map((s, i) => ({
          id: i + 1,
          image: s.customImage || s.image,
          title: '',
          description: '',
          ctaLink: s.ctaLink,
        })));
      })
      .catch(() => {});
  }, []);

  if (slides.length === 0) return null;

  return (
    <Slider
      slides={slides}
      autoPlay={true}
      autoPlayInterval={5000}
      showControls={false}
      showIndicators={true}
      height="h-[160px] sm:h-[200px]"
    />
  );
}

interface StatCard {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
  bg: string;
  href?: string;
}

interface UserOverviewProps {
  userName: string;
  statCards: StatCard[];
  userEmail?: string;
}

function UserOverview({ userName, statCards, userEmail }: UserOverviewProps) {
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="w-full overflow-x-hidden bg-gray-50 pb-4">
      {/* Profile header */}
      <div className="bg-white border-b border-gray-100 px-1 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{userName}</h2>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">Client</span>
          </div>
        </div>
      </div>

      {/* Promo banner slider */}
      <PromoSlider />

      <div className="px-1 py-3 space-y-3">
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

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Meta Ads Performance */}
        <MetaOverviewSection />
      </div>
    </div>
  );
}

// ── Meta account summary card (shown on admin overview) ─────────────────
const BDT_RATE = 145;

function usdCentsToNum(cents: string | undefined): number {
  if (!cents) return 0;
  return parseInt(cents, 10) / 100;
}

function fmtUSD(cents: string | undefined, currency: string) {
  if (!cents) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(usdCentsToNum(cents));
}

function fmtBDT(n: number) {
  return '৳ ' + new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(n);
}

const ACCOUNT_STATUS: Record<number, { label: string; dot: string }> = {
  1: { label: 'Active',            dot: 'bg-green-500' },
  2: { label: 'Disabled',          dot: 'bg-red-500' },
  3: { label: 'Unsettled',         dot: 'bg-yellow-500' },
  7: { label: 'Pending',           dot: 'bg-blue-500' },
  9: { label: 'In Grace Period',   dot: 'bg-orange-500' },
  100: { label: 'Pending Closure', dot: 'bg-gray-400' },
  101: { label: 'Closed',           dot: 'bg-gray-400' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { team, services } = useSiteData();
  const portfolio = useMemo(() => AdminStore.getPortfolio(), []);
  const isAdmin = user?.role === 'ADMIN';
  const userName = user?.fullName || user?.username || 'User';
  const [totalClients, setTotalClients] = useState<number | null>(null);
  const [unseenMessages, setUnseenMessages] = useState<number | null>(null);
  const [acct, setAcct] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTotalClients(d.data.totalClients);
          setUnseenMessages(d.data.unseenMessages ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/v1/meta/account?account_id=act_586481100654531')
        .then(r => r.json())
        .then(d => { if (d.success) setAcct(d.data); })
        .catch(() => {});
    }
  }, [isAdmin]);

  const statCards: StatCard[] = [
    { label: 'Total Clients', value: totalClients ?? '—', icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Team Members', value: team.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Portfolio Items', value: portfolio.length, icon: Briefcase, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Services', value: services.length, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Unseen Messages', value: unseenMessages ?? '—', icon: BellDot, color: unseenMessages ? 'text-orange-600' : 'text-gray-400', bg: unseenMessages ? 'bg-orange-50' : 'bg-gray-50', href: '/dashboard/messages' },
  ];

  if (!isAdmin) {
    return (
      <AdminShell>
        <UserOverview
          userName={userName}
          statCards={statCards}
          userEmail={user?.email}
        />
      </AdminShell>
    );
  }

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
                {acct ? (
                  <div className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-white shadow-md shadow-red-500/20">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-medium text-red-200 uppercase tracking-wide leading-none mb-0.5">Total Ad Spend (BDT)</p>
                      <p className="text-sm font-bold leading-none truncate">{fmtBDT(usdCentsToNum(acct.amount_spent) * BDT_RATE)}</p>
                    </div>
                    <div className="ml-1 shrink-0 flex items-center gap-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${ACCOUNT_STATUS[acct.account_status]?.dot ?? 'bg-gray-400'}`} />
                      <span className="text-[10px] font-semibold text-white">{ACCOUNT_STATUS[acct.account_status]?.label ?? 'Unknown'}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <BarChart2 className="h-4 w-4" />
                    <span>Overview Dashboard</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-3 py-3 sm:p-6 space-y-4 sm:space-y-6">

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map((card) => {
              const Icon = card.icon;
              const inner = (
                <>
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                    {card.label === 'Unseen Messages' && (unseenMessages ?? 0) > 0 && (
                      <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                </>
              );
              const cls = `rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow${card.href ? ' cursor-pointer' : ''}`;
              return card.href ? (
                <Link key={card.label} href={card.href} className={cls}>{inner}</Link>
              ) : (
                <div key={card.label} className={cls}>{inner}</div>
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
