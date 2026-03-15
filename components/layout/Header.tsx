'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { ChevronDown, LayoutDashboard, User, Phone, Mail, Search, Bell, Home, Briefcase, Users, Menu, X, ArrowRight, LogOut } from 'lucide-react';
import { MoreDrawer } from '@/components/ui/MoreDrawer';

const DUMMY_NOTIFICATIONS = [
  { id: 1, title: 'New message received', desc: 'Rafiq Ahmed sent you a message', time: '2m ago', unread: true },
  { id: 2, title: 'Project update', desc: 'Your web dev project is 80% complete', time: '1h ago', unread: true },
  { id: 3, title: 'Invoice paid', desc: 'Invoice #1042 has been paid', time: '3h ago', unread: false },
  { id: 4, title: 'New review', desc: 'Fatima Khatun left a 5-star review', time: 'Yesterday', unread: false },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [scrolled, setScrolled] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    const shouldLockScroll = showSearch || showNotif || showMoreDrawer;
    document.documentElement.style.overflow = shouldLockScroll ? 'hidden' : '';
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showSearch, showNotif, showMoreDrawer]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowSearch(false); setShowNotif(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

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
    { label: 'Home', href: '/' },
    { label: 'About us', href: '/about' },
    { label: 'Features', href: '/features' },
    { label: 'Service', href: '/service' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const visibleNavItems = navItems;

  return (
    <header className={`relative z-50 lg:fixed lg:top-0 lg:left-0 lg:right-0 transition-all duration-300 ${scrolled ? 'lg:bg-white lg:shadow-md' : 'lg:bg-transparent'}`}>
      {/* Mobile Top Bar - Logo + Icons */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-100">
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

          {/* Icons: Search, Notification, Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowSearch(true); setShowNotif(false); }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => { setShowNotif(true); setShowSearch(false); }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </button>
            <Link href={isAuthenticated ? "/dashboard/profile" : "/login"} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm">
              {isAuthenticated ? (
                <span className="text-gray-700 font-bold text-sm">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
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
                    <div className="w-9 h-9 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="font-medium text-gray-900 text-sm">{user?.email}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Client Account</div>
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
                          await logout();
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden justify-around items-center px-2 pt-1 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 min-w-0 ${
            pathname === '/' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/service"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 min-w-0 ${
            pathname === '/service' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium">Service</span>
        </Link>
        <Link
          href="/team"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 min-w-0 ${
            pathname === '/team' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Team</span>
        </Link>
        <button
          onClick={() => setShowMoreDrawer(true)}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-gray-500 hover:text-red-500 transition-colors flex-1 min-w-0"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      <MoreDrawer open={showMoreDrawer} onClose={() => setShowMoreDrawer(false)} />

      {/* ── Search Panel (right → left slide) ── */}
      {/* Backdrop */}
      {showSearch && (
        <div
          className="fixed inset-0 z-[90] bg-black/30 lg:hidden"
          onClick={() => setShowSearch(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-[91] h-full w-4/5 max-w-sm bg-white shadow-2xl flex flex-col lg:hidden
          transition-transform duration-300 ease-in-out
          ${showSearch ? 'translate-x-0' : 'translate-x-full'}`}
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

      {/* ── Notification Panel (right → left slide) ── */}
      {showNotif && (
        <div
          className="fixed inset-0 z-[90] bg-black/30 lg:hidden"
          onClick={() => setShowNotif(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-[91] h-full w-4/5 max-w-sm bg-white shadow-2xl flex flex-col lg:hidden
          transition-transform duration-300 ease-in-out
          ${showNotif ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800 text-base">Notifications</span>
          <button onClick={() => setShowNotif(false)} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {DUMMY_NOTIFICATIONS.map((n) => (
            <div key={n.id} className={`px-4 py-3.5 flex gap-3 ${n.unread ? 'bg-red-50/50' : ''}`}>
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.unread ? 'bg-red-500' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{n.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
