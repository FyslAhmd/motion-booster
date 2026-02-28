'use client';

import AdminShell from './_components/AdminShell';
import { AdminStore } from '@/lib/admin/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Users, MessageSquare, Star, BarChart2, Settings, TrendingUp, Eye } from 'lucide-react';

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState({ services: 0, team: 0, faqs: 0, testimonials: 0, stats: 0 });

  useEffect(() => {
    setCounts({
      services: AdminStore.getServices().length,
      team: AdminStore.getTeam().length,
      faqs: AdminStore.getFAQs().length,
      testimonials: AdminStore.getTestimonials().length,
      stats: AdminStore.getStats().length,
    });
  }, []);

  const cards = [
    { label: 'Services', count: counts.services, href: '/admin/services', icon: Layers, color: 'from-purple-500 to-purple-700', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Team Members', count: counts.team, href: '/admin/team', icon: Users, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'FAQs', count: counts.faqs, href: '/admin/faq', icon: MessageSquare, color: 'from-green-500 to-green-700', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Testimonials', count: counts.testimonials, href: '/admin/testimonials', icon: Star, color: 'from-amber-500 to-amber-700', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Stats & Achievements', count: counts.stats, href: '/admin/stats', icon: BarChart2, color: 'from-red-500 to-red-700', bg: 'bg-red-50', text: 'text-red-600' },
  ];

  const quickLinks = [
    { label: 'Manage Services', href: '/admin/services', desc: 'Add, edit or remove service cards shown on homepage' },
    { label: 'Manage Team', href: '/admin/team', desc: 'Update team member profiles and details' },
    { label: 'Manage FAQs', href: '/admin/faq', desc: 'Edit frequently asked questions' },
    { label: 'Manage Testimonials', href: '/admin/testimonials', desc: 'Curate client reviews and ratings' },
    { label: 'Stats & Numbers', href: '/admin/stats', desc: 'Update achievement statistics shown on site' },
    { label: 'Site Settings', href: '/admin/settings', desc: 'Update site name, contact info, social links' },
  ];

  return (
    <AdminShell>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin! Manage all website content from here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.text}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-red-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors">{link.label}</span>
              <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Preview Link */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">View Live Website</div>
          <div className="text-white/50 text-sm">See how your changes look on the public site</div>
        </div>
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </a>
      </div>
    </AdminShell>
  );
}
