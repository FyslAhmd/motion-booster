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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
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
  Sparkles,
  User,
  MoreHorizontal,
  Home,
} from 'lucide-react';
interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

interface NavGroup {
  group: true;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

const navItems: NavEntry[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, adminOnly: true },
  { href: '/dashboard/meta', label: 'Ads Manager', icon: Megaphone, adminOnly: true },
  { href: '/dashboard/chat', label: 'Chat Messages', icon: MessageCircle },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, adminOnly: true },
  {
    group: true,
    label: 'Home Page',
    icon: Home,
    adminOnly: true,
    children: [
      { href: '/dashboard/welcome-modal',    label: 'Welcome Popup',       icon: Sparkles },
      { href: '/dashboard/hero-slider',      label: 'Hero Slider',         icon: SlidersHorizontal },
      { href: '/dashboard/categories',       label: 'Service Categories',  icon: LayoutGrid },
      { href: '/dashboard/popular-services', label: 'Popular Services',    icon: Flame },
      { href: '/dashboard/companies',        label: 'Companies',           icon: Building2 },
      { href: '/dashboard/stats',            label: 'Stats & Achievements',icon: BarChart2 },
      { href: '/dashboard/portfolio',        label: 'Portfolio',           icon: FolderOpen },
      { href: '/dashboard/testimonials',     label: 'Testimonials',        icon: Quote },
      { href: '/dashboard/team',             label: 'Team',                icon: Users },
      { href: '/dashboard/faq',              label: 'FAQ',                 icon: HelpCircle },
    ],
  },
  { href: '/dashboard/settings', label: 'Site Settings', icon: Settings, adminOnly: true },
];

// Routes accessible by normal users (no admin required)
const USER_ALLOWED_ROUTES = [
  '/dashboard',
  '/dashboard/chat',
  '/dashboard/meta',
  '/dashboard/profile',
];

// ── User Shell (non-admin layout) ─────────────────────────────────────────
function UserShell({ children, userName, noPadding }: { children: React.ReactNode; userName: string; noPadding?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userNavItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
  ];

  const activeLabel = userNavItems.find(n => n.href === pathname)?.label ?? 'Dashboard';

  return (
    <div className={`${noPadding ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50 flex flex-col`}>
      {/* Top bar */}
      <header className="shrink-0 z-20 bg-white border-b border-gray-100 h-14 flex items-center px-4 justify-between shadow-sm">
        <Link href="/dashboard">
          <Image
            src="/Motion Booster Black Logo-01.svg"
            alt="Motion Booster"
            width={130}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span className="hidden sm:block">{activeLabel}</span>
          <Link href="/dashboard/profile">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
              {userName.slice(0, 2).toUpperCase()}
            </div>
          </Link>
        </div>
      </header>

      {/* Page content — flex-1 + min-h-0 so it doesn't overflow on noPadding pages */}
      <main className={`flex-1 min-h-0 w-full min-w-0 ${noPadding ? 'overflow-hidden' : 'overflow-x-hidden overflow-y-auto'}`}>
        {children}
      </main>

      {/* Bottom nav — shrink-0 so it's always visible at bottom of flex column */}
      <nav className="shrink-0 z-30 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 px-2">
        {userNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 flex-1 transition-colors ${active ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        {/* More — opens client sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 flex-1 text-gray-500 hover:text-red-500 transition-colors"
        >
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Client sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />

          {/* Sidebar panel */}
          <aside className="relative w-72 max-w-[80vw] h-full bg-white flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <Image
                src="/Motion Booster Black Logo-01.svg"
                alt="Motion Booster"
                width={130}
                height={40}
                className="h-8 w-auto"
                priority
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {userNavItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto text-white/70" />}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 space-y-0.5">
              <Link
                href="/dashboard/profile"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === '/dashboard/profile' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold">{userName}</p>
                  <p className="text-[10px] text-gray-400 font-normal">My Profile</p>
                </div>
                <User className="w-3.5 h-3.5 shrink-0 text-gray-400" />
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
        </div>
      )}
    </div>
  );
}

export default function AdminShell({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>('Home Page'); // open by default
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ── Non-admin users: custom user shell ───────────────────────────────────
  if (!isAdmin) {
    return <UserShell userName={adminName} noPadding={noPadding}>{children}</UserShell>;
  }

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
            <div className="text-gray-400 text-xs mt-1 pl-0.5 font-medium tracking-wide uppercase">{isAdmin ? 'Admin Panel' : 'Dashboard'}</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map(entry => {
            // ── Group ──
            if ('group' in entry) {
              const isOpen = openGroup === entry.label;
              const groupActive = entry.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
              return (
                <div key={entry.label}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : entry.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      groupActive && !isOpen
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                    }`}
                  >
                    <entry.icon className={`w-4 h-4 shrink-0 ${groupActive && !isOpen ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="flex-1 text-left">{entry.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
                      {entry.children.map(child => {
                        const CIcon = child.icon;
                        const active = pathname === child.href || pathname.startsWith(child.href + '/');
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                              active
                                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                            }`}
                          >
                            <CIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                            <span className="flex-1 text-[13px]">{child.label}</span>
                            {active && <ChevronRight className="w-3 h-3 text-white/70" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ── Regular item ──
            const Icon = entry.icon;
            const active = pathname === entry.href;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1">{entry.label}</span>
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
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
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
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              {(() => {
                const flat = visibleNavItems.flatMap(e => 'group' in e ? e.children : [e]);
                return flat.find(n => n.href === pathname)?.label ?? (isAdmin ? 'Admin Panel' : 'Dashboard');
              })()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 hidden sm:block">{adminName}</div>
            <Link href="/dashboard/profile">
              {adminAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={adminAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
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
