'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { LayoutDashboard, User, Phone, Mail, Search, Home, Briefcase, Users, Menu, X, ArrowRight, LogOut, Bell } from 'lucide-react';
import { MoreDrawer } from '@/components/ui/MoreDrawer';
import { toast } from 'sonner';

export const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  useEffect(() => {
    // Keep drawer scrolling reliable on mobile by not locking body for MoreDrawer.
    // Search/notification panels still lock background scroll.
    const shouldLockScroll = showSearch || showNotifications;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showSearch, showMoreDrawer, showNotifications]);

  useEffect(() => {
    document.documentElement.classList.add('public-page');
    document.body.classList.add('public-page');
    return () => {
      document.documentElement.classList.remove('public-page');
      document.body.classList.remove('public-page');
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const navItems = [
    { label: t('nav_home'), href: '/' },
    { label: t('nav_about'), href: '/about' },
    { label: t('nav_features'), href: '/features' },
    { label: t('nav_service'), href: '/service' },
    { label: t('nav_blog'), href: '/blog' },
    { label: t('nav_contact'), href: '/contact' },
  ];

  const visibleNavItems = navItems;
  const userInitial = (user?.fullName || user?.username || user?.email || 'U').trim().charAt(0).toUpperCase();
  const userAvatarUrl = user?.avatarUrl?.trim() || '';
  const accountLabel = user?.role === 'ADMIN' ? 'Admin Account' : 'Client Account';

  return (
    <header className={`relative z-120 lg:fixed lg:top-0 lg:left-0 lg:right-0 transition-all duration-300 ${scrolled ? 'lg:bg-white lg:shadow-md' : 'lg:bg-transparent'}`}>
      {/* Mobile Top Bar - Logo + Icons */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-130 py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-40 h-12">
              <Image
                src="/Motion Booster Black Logo-01.svg"
                alt="Motion Booster Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Icons: Search, Notifications, Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowNotifications(false);
                setShowSearch(true);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                setShowSearch(false);
                setShowNotifications(prev => !prev);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <Link href={isAuthenticated ? "/dashboard" : "/login"} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm">
              {isAuthenticated ? (
                userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userAvatarUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="text-gray-700 font-bold text-sm">{userInitial}</span>
                )
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </Link>
          </div>
        </div>
      </div>
      <div className="lg:hidden h-18.5" aria-hidden="true" />

      {/* Desktop Top Bar */}
      <div className="hidden lg:block text-white" style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)', padding: '7px 0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            {/* Contact Info */}
            <div className="flex items-center gap-6">
              <a href="tel:+8801790939394" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">+880 1790-939394</span>
              </a>
              <a href="mailto:hello@motionbooster.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Mail className="w-4 h-4" />
                <span className="hidden md:inline">hello@motionbooster.com</span>
              </a>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('BN')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  language === 'BN' ? 'bg-white text-red-600' : 'hover:bg-red-700'
                }`}
              >
                BN
              </button>
              <button
                onClick={() => setLanguage('EN')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  language === 'EN' ? 'bg-white text-red-600' : 'hover:bg-red-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="hidden lg:block max-w-7xl mx-auto px-6 lg:px-8 mt-2">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-48 h-14">
              <Image
                src="/Motion Booster Black Logo-01.svg"
                alt="Motion Booster Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`font-semibold text-base transition-colors ${
                    isActive ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Auth & Login Button */}
            <div className="flex items-center gap-3">
              {!isLoading && isAuthenticated ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userAvatarUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {userInitial}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="font-medium text-gray-900 text-sm">{user?.email}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{accountLabel}</div>
                      </div>
                      <Link href="/dashboard">
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                      </Link>
                      <Link href="/dashboard/profile">
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            toast.success('Logged out successfully');
                          } catch {
                            toast.error('Failed to logout. Please try again.');
                          }
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 text-sm transition-colors border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* Bottom Navbar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-130 flex lg:hidden justify-around items-center px-2 pt-1 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-white border-t border-gray-200 shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 min-w-0 ${
            pathname === '/' ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/service"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 min-w-0 ${
            pathname === '/service' ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium">Service</span>
        </Link>
        <Link
          href="/team"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 min-w-0 ${
            pathname === '/team' ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Team</span>
        </Link>
        <button
          onClick={() => setShowMoreDrawer(true)}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-gray-500 transition-colors flex-1 min-w-0"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      <MoreDrawer open={showMoreDrawer} onClose={() => setShowMoreDrawer(false)} />

      {/* Mobile Notifications Panel */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 z-135 bg-black/30 lg:hidden" onClick={() => setShowNotifications(false)} />
          <div ref={notificationPanelRef} className="fixed top-[4.6rem] left-3 right-3 z-140 rounded-2xl border border-gray-200 bg-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-xs font-medium text-gray-500 hover:text-gray-700">Close</button>
            </div>

            {isAuthenticated ? (
              <div className="max-h-[58vh] overflow-y-auto py-2">
                {[
                  { id: 'n1', title: 'New message received', text: 'You have a new chat message in dashboard inbox.', time: 'Just now' },
                  { id: 'n2', title: 'Campaign update', text: 'One of your campaigns has a fresh status update.', time: '12m ago' },
                  { id: 'n3', title: 'Support reply', text: 'Our team replied to your latest request.', time: '1h ago' },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href="/dashboard/chat"
                    onClick={() => setShowNotifications(false)}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.text}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{item.time}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5">
                <p className="text-sm text-gray-700 mb-3">Login করলে তোমার notification messages এখানে show হবে.</p>
                <Link
                  href="/login"
                  onClick={() => setShowNotifications(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Login to view
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Search Panel (right → left slide) ── */}
      {/* Backdrop */}
      {showSearch && (
        <div
          className="fixed inset-0 z-140 bg-black/30 lg:hidden"
          onClick={() => setShowSearch(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-150 h-full w-4/5 max-w-sm bg-white flex flex-col lg:hidden
          transition-transform duration-300 ease-in-out
          ${showSearch ? 'translate-x-0 shadow-2xl pointer-events-auto' : 'translate-x-full shadow-none pointer-events-none'}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800 text-base">Search</span>
          <button onClick={() => setShowSearch(false)} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, blogs..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
        {searchQuery.trim() && (
          <div className="px-4 mt-3 flex-1 overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2">Press Enter to search for <span className="font-semibold text-gray-600">&ldquo;{searchQuery}&rdquo;</span></p>
            {['/service', '/blog', '/about', '/contact'].map((href) => (
              <Link
                key={href}
                href={`${href}?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowSearch(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700 capitalize">{href.replace('/', '')}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>

    </header>
  );
};
