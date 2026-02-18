'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { ChevronDown, LayoutDashboard, User } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
    { label: 'Features', href: '/#features' },
    { label: 'Service', href: '/service' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const visibleNavItems = navItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-green-500">Motion</span>
              <span className="text-black">Booster</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleNavItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-black font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  {item.label}
                </Link>
              </div>
            ))}

            {/* Auth Buttons */}
            {!isLoading && (
              isAuthenticated ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-9 h-9 bg-linear-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
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
                <Link
                  href="/login"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-full transition-colors"
                >
                  Login
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {!isLoading && isAuthenticated && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{user?.email?.split('@')[0] || 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
            )}
            
            {visibleNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-3 text-gray-700 hover:text-black font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-3 text-gray-700 hover:text-black font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="block py-3 text-gray-700 hover:text-black font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-3 text-purple-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
