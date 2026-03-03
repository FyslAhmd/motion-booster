'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { ChevronDown, LayoutDashboard, User, Phone, Mail, Search, Bell, Home, Briefcase, Users, Menu } from 'lucide-react';
import { MoreDrawer } from '@/components/ui/MoreDrawer';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [scrolled, setScrolled] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);
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
    <header className={`z-50 lg:fixed lg:top-0 lg:left-0 lg:right-0 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      {/* Mobile Top Bar - Logo + Icons */}
      <div className={`lg:hidden py-3 px-4 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
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
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative">
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
              <a href="mailto:info@motionbooster.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Mail className="w-4 h-4" />
                <span className="hidden md:inline">info@motionbooster.com</span>
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
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-red-500 font-semibold text-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* Bottom Navbar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg flex lg:hidden justify-around items-center h-16 px-2">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 ${
            pathname === '/' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/service"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 ${
            pathname === '/service' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium">Service</span>
        </Link>
        <Link
          href="/team"
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 ${
            pathname === '/team' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Team</span>
        </Link>
        <button
          onClick={() => setShowMoreDrawer(true)}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-gray-500 hover:text-red-500 transition-colors flex-1"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      <MoreDrawer open={showMoreDrawer} onClose={() => setShowMoreDrawer(false)} />
    </header>
  );
};
