'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/context';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart2,
  Globe,
  FolderOpen,
  LayoutGrid,
  SlidersHorizontal,
  MessageCircle,
  Megaphone,
  UserCog,
  Building2,
  Flame,
  Quote,
} from 'lucide-react';

<<<<<<< HEAD
interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, adminOnly: true },
  { href: '/dashboard/hero-slider', label: 'Hero Slider', icon: SlidersHorizontal, adminOnly: true },
  { href: '/dashboard/services', label: 'Services', icon: Layers, adminOnly: true },
  { href: '/dashboard/categories', label: 'Service Categories', icon: LayoutGrid, adminOnly: true },
  { href: '/dashboard/popular-services', label: 'Popular Services', icon: Briefcase, adminOnly: true },
  { href: '/dashboard/team', label: 'Team', icon: Users, adminOnly: true },
  { href: '/dashboard/faq', label: 'FAQ', icon: MessageSquare, adminOnly: true },
  { href: '/dashboard/testimonials', label: 'Testimonials', icon: Star, adminOnly: true },
  { href: '/dashboard/stats', label: 'Stats & Achievements', icon: BarChart2, adminOnly: true },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: Briefcase, adminOnly: true },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2, adminOnly: true },
  { href: '/dashboard/chat', label: 'Chat Messages', icon: MessageCircle },
  { href: '/dashboard/meta', label: 'Meta Connect', icon: Share2 },
  { href: '/dashboard/settings', label: 'Site Settings', icon: Settings, adminOnly: true },
];

// Routes accessible by normal users (no admin required)
const USER_ALLOWED_ROUTES = [
  '/dashboard/chat',
  '/dashboard/meta',
  '/dashboard/profile',
=======
const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/hero-slider', label: 'Hero Slider', icon: SlidersHorizontal },
  { href: '/dashboard/categories', label: 'Service Categories', icon: LayoutGrid },
  { href: '/dashboard/popular-services', label: 'Popular Services', icon: Flame },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/dashboard/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/dashboard/stats', label: 'Stats & Achievements', icon: BarChart2 },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: FolderOpen },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
  { href: '/dashboard/chat', label: 'Chat Messages', icon: MessageCircle },
  { href: '/dashboard/meta', label: 'Ads Manager', icon: Megaphone },
  { href: '/dashboard/settings', label: 'Site Settings', icon: Settings },
>>>>>>> 9e38dd9 (updated dashbopard ui)
];

export default function AdminShell({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminName = user?.username || user?.email || 'User';
  const adminAvatar = '';
  const isAdmin = user?.role === 'ADMIN';

  // Filter nav items based on role
  const visibleNavItems = isAdmin
    ? navItems
    : navItems.filter((item) => !item.adminOnly);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Route guard: redirect non-admin users away from admin-only pages
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      const isAllowed = USER_ALLOWED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );
      if (!isAllowed) {
        router.replace('/dashboard/chat');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={`${noPadding ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50 flex`}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-30 transition-transform duration-300 shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
<<<<<<< HEAD
        <div className="px-5 py-4 border-b border-gray-100">
          <Image
            src="/Motion Booster Black Logo-01.svg"
            alt="Motion Booster"
            width={160}
            height={48}
            className="h-9 w-auto"
            priority
          />
          <div className="text-gray-400 text-xs mt-1 pl-0.5 font-medium tracking-wide uppercase">{isAdmin ? 'Admin Panel' : 'Dashboard'}</div>
=======
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Image
              src="/Motion Booster Black Logo-01.svg"
              alt="Motion Booster"
              width={160}
              height={48}
              className="h-9 w-auto"
              priority
            />
            <div className="text-gray-400 text-xs mt-1 pl-0.5 font-medium tracking-wide uppercase">Admin Panel</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
>>>>>>> 9e38dd9 (updated dashbopard ui)
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map(item => {
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
            {adminAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={adminAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold">{adminName}</p>
              <p className="text-[10px] text-gray-400 font-normal">{isAdmin ? 'Admin Profile' : 'My Profile'}</p>
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
      <div className={`flex-1 flex flex-col ${noPadding ? 'overflow-hidden' : 'min-h-screen'} lg:min-w-0`}>
        {/* Top bar — mobile only */}
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
<<<<<<< HEAD
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              {visibleNavItems.find(n => n.href === pathname)?.label ?? (isAdmin ? 'Admin Panel' : 'Dashboard')}
=======
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              {navItems.find(n => n.href === pathname)?.label ?? 'Admin Panel'}
>>>>>>> 9e38dd9 (updated dashbopard ui)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 hidden sm:block">{adminName}</div>
            <Link href="/dashboard/profile">
              {adminAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={adminAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 ${noPadding ? 'overflow-hidden' : 'p-4 sm:p-6 overflow-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
