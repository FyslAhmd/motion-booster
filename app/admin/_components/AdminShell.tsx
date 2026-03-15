'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminAuth } from '@/lib/admin/context';
import { useAuth } from '@/lib/auth/context';
import { AdminStore } from '@/lib/admin/store';
import PageTransition from '@/components/ui/PageTransition';
import {
  LayoutDashboard,
  Layers,
  Users,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart2,
  Globe,
  Briefcase,
  LayoutGrid,
  SlidersHorizontal,
  MessageCircle,
  Share2,
  UserCog,
  Building2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/hero-slider', label: 'Hero Slider', icon: SlidersHorizontal },
  { href: '/dashboard/services', label: 'Services', icon: Layers },
  { href: '/dashboard/categories', label: 'Service Categories', icon: LayoutGrid },
  { href: '/dashboard/popular-services', label: 'Popular Services', icon: Briefcase },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/faq', label: 'FAQ', icon: MessageSquare },
  { href: '/dashboard/testimonials', label: 'Testimonials', icon: Star },
  { href: '/dashboard/stats', label: 'Stats & Achievements', icon: BarChart2 },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
  { href: '/dashboard/chat', label: 'Chat Messages', icon: MessageCircle },
  { href: '/dashboard/meta', label: 'Meta Connect', icon: Share2 },
  { href: '/dashboard/settings', label: 'Site Settings', icon: Settings },
];

export default function AdminShell({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
  const { isLoggedIn, logout } = useAdminAuth();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const p = AdminStore.getProfile();
    setAdminName(p.displayName || 'Admin');
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/dashboard/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          Redirecting...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col z-30 transition-transform duration-300 shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <Image
              src="/Motion Booster Black Logo-01.svg"
              alt="Motion Booster"
              width={160}
              height={48}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="text-gray-400 text-xs mt-1 pl-0.5 font-medium tracking-wide uppercase">Admin Panel</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          {/* Admin profile link */}
          <Link
            href="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/dashboard/profile' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
            }`}
          >
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold">{adminName}</p>
              <p className="text-[10px] text-gray-400 font-normal">Admin Profile</p>
            </div>
            <UserCog className={`w-3.5 h-3.5 shrink-0 ${pathname === '/admin/profile' ? 'text-white/70' : 'text-gray-400'}`} />
          </Link>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <Globe className="w-4 h-4" />
            View Website
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar — mobile only */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              {navItems.find(n => n.href === pathname)?.label ?? 'Admin Panel'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 hidden sm:block">{adminName}</div>
            <Link href="/dashboard/profile">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 lg:pt-0 pt-14 ${noPadding ? '' : 'p-4 sm:p-6'}`}>
          <PageTransition variant="admin">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
