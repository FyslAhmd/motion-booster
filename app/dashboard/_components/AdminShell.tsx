'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/context';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import PageTransition from '@/components/ui/PageTransition';
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
  Home,
  UserCheck,
  Rocket,
  BookOpen,
  DollarSign,
  Inbox,
  History,
  Bell,
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

interface UserNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requiresCampaignAccess?: boolean;
}

const navItems: NavEntry[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, adminOnly: true },
  { href: '/dashboard/meta', label: 'Ads Manager', icon: Megaphone, adminOnly: true },
  { href: '/dashboard/user-campaigns', label: 'Assign User', icon: UserCheck, adminOnly: true },
  { href: '/dashboard/chat', label: 'Chat Messages', icon: MessageCircle },
  { href: '/dashboard/media-message', label: 'Media Message', icon: Inbox, adminOnly: true },
  { href: '/dashboard/boost-requests', label: 'Boost Requests', icon: Rocket, adminOnly: true },
  { href: '/dashboard/user-budget', label: 'User Budget', icon: DollarSign, adminOnly: true },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, adminOnly: true },
  { href: '/dashboard/history', label: 'Activity History', icon: History, adminOnly: true },
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
      { href: '/dashboard/blog',             label: 'Blog Posts',          icon: BookOpen },
    ],
  },
  { href: '/dashboard/settings', label: 'Site Settings', icon: Settings, adminOnly: true },
];

// ── User Shell (non-admin layout) ─────────────────────────────────────────
function UserShell({ children, userName, avatarUrl, noPadding }: { children: React.ReactNode; userName: string; avatarUrl?: string | null; noPadding?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hasAssignedCampaigns, setHasAssignedCampaigns] = useState<boolean | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userNavItems: UserNavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, requiresCampaignAccess: true },
    { href: '/dashboard/my-campaigns', label: 'My Campaign', icon: Megaphone, requiresCampaignAccess: true },
    { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart2, requiresCampaignAccess: true },
  ];

  const isNewClient = hasAssignedCampaigns === false;

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    fetch(`/api/v1/admin/meta-assignments/users/${user.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const campaigns = Array.isArray(json?.data?.campaigns) ? json.data.campaigns : [];
        setHasAssignedCampaigns(campaigns.length > 0);
      })
      .catch(() => {
        if (!cancelled) {
          setHasAssignedCampaigns(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isNewClient) return;

    const isAllowed = pathname === '/dashboard/chat' || pathname.startsWith('/dashboard/chat/');
    if (!isAllowed) {
      router.replace('/dashboard/chat');
    }
  }, [isNewClient, pathname, router]);

  const activeLabel = userNavItems.find(n => n.href === pathname)?.label ?? 'Dashboard';

  return (
    <div className="h-svh min-h-svh bg-gray-50 flex flex-col overflow-hidden lg:pl-64">
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-100 lg:z-40">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/dashboard">
            <Image src="/Motion Booster Black Logo-01.svg" alt="Motion Booster" width={130} height={40} className="h-8 w-auto" priority />
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {userNavItems.map(({ href, label, icon: Icon }) => {
            const disabled = isNewClient && href !== '/dashboard/chat';
            const active = pathname === href;
            return (
              <button
                key={href}
                type="button"
                onClick={() => {
                  if (disabled) return;
                  router.push(href);
                }}
                disabled={disabled}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : active
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-white/70" />}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard/profile' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'}`}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold">{userName}</p>
              <p className="text-[10px] text-gray-400 font-normal">My Profile</p>
            </div>
            <User className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          </Link>
          <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium">
            <Globe className="w-4 h-4" />
            View Website
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="shrink-0 z-20 bg-white border-b border-gray-100 h-18.5 flex items-center px-4 justify-between shadow-sm">
        <Link href="/dashboard" className="lg:hidden">
          <Image
            src="/Motion Booster Black Logo-01.svg"
            alt="Motion Booster"
            width={130}
            height={40}
            className="h-12 w-auto"
            priority
          />
        </Link>
        <span className="hidden lg:block text-base font-semibold text-gray-800">{activeLabel}</span>
        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
          <span className="hidden sm:block lg:hidden">{activeLabel}</span>
          <button
            type="button"
            aria-label="Notifications"
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen((o) => !o)}
              className="flex items-center focus:outline-none"
              aria-label="Profile menu"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent hover:ring-red-300 transition-all" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-red-300 transition-all">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </button>
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-2xl bg-white border border-gray-100 shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-[10px] text-gray-400">My Account</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { setProfileDropdownOpen(false); router.push('/dashboard/profile'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => { setProfileDropdownOpen(false); logout(); router.push('/login'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content — flex-1 + min-h-0 so it doesn't overflow on noPadding pages */}
      <main className={`flex-1 min-h-0 w-full min-w-0 no-scrollbar ${noPadding ? 'overflow-hidden' : 'overflow-x-hidden overflow-y-auto'}`}>
        <PageTransition variant="admin" className={noPadding ? 'h-full w-full' : undefined}>
          {children}
        </PageTransition>
      </main>

      {/* Bottom nav — shrink-0 so it's always visible at bottom of flex column */}
      <nav className="lg:hidden shrink-0 z-30 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 px-2">
        {userNavItems.map(({ href, label, icon: Icon }) => {
          const disabled = isNewClient && href !== '/dashboard/chat';
          const active = pathname === href;
          return (
            <button
              key={href}
              type="button"
              onClick={() => {
                if (disabled) return;
                router.push(href);
              }}
              disabled={disabled}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 flex-1 transition-colors ${
                disabled
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : active
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="whitespace-nowrap text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
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
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
              {userNavItems.map(({ href, label, icon: Icon }) => {
                const disabled = isNewClient && href !== '/dashboard/chat';
                const active = pathname === href;
                return (
                  <button
                    key={href}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      setSidebarOpen(false);
                      router.push(href);
                    }}
                    disabled={disabled}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      disabled
                        ? 'opacity-50 cursor-not-allowed text-gray-400'
                        : active
                          ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-red-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto text-white/70" />}
                  </button>
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
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const adminName = user?.username || user?.email || 'User';
  const adminAvatar = user?.avatarUrl || '';
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
      if (pathname === '/dashboard/user-campaigns' || pathname.startsWith('/dashboard/user-campaigns/')) {
        router.replace('/dashboard/my-campaigns');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, pathname, router]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Track dashboard route visits for history timeline.
  useEffect(() => {
    if (!isAuthenticated || !pathname.startsWith('/dashboard')) {
      return;
    }

    const storageKey = 'mb:lastTrackedDashboardPath';
    const lastTrackedPath = sessionStorage.getItem(storageKey);
    if (lastTrackedPath === pathname) {
      return;
    }
    sessionStorage.setItem(storageKey, pathname);

    void fetch('/api/v1/history/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, action: 'PAGE VISIT' }),
    }).catch(() => {
      // Silently ignore tracking failures in UI.
    });
  }, [isAuthenticated, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <AdminSectionSkeleton variant="meta" />
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
    return <UserShell userName={adminName} avatarUrl={user?.avatarUrl} noPadding={noPadding}>{children}</UserShell>;
  }

  return (
    <div className="h-svh min-h-svh bg-gray-50 flex overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-svh w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-sm lg:w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-18.5 px-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex h-full flex-col justify-center">
            <div className="relative w-40 h-9">
              <Image
                src="/Motion Booster Black Logo-01.svg"
                alt="Motion Booster"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="pl-0.5 pt-0.5 text-[12px] leading-3 font-medium uppercase tracking-wide text-gray-400">{isAdmin ? 'Admin Panel' : 'Dashboard'}</div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
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
              <Image src={adminAvatar} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar — mobile only */}
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 h-18.5 flex items-center justify-between gap-4">
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
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 hidden sm:block">{adminName}</div>
            <button
              type="button"
              aria-label="Notifications"
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            {/* Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((o) => !o)}
                className="flex items-center focus:outline-none"
                aria-label="Profile menu"
              >
                {adminAvatar ? (
                  <Image src={adminAvatar} alt="avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent hover:ring-red-300 transition-all" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-red-300 transition-all">
                    {adminName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </button>
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-2xl bg-white border border-gray-100 shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{adminName}</p>
                      <p className="text-[10px] text-gray-400">My Account</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); router.push('/dashboard/profile'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 min-h-0 w-full min-w-0 no-scrollbar ${noPadding ? 'overflow-hidden' : 'p-4 sm:p-6 overflow-y-auto'}`}>
          <PageTransition variant="admin" className={noPadding ? 'h-full w-full' : undefined}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
