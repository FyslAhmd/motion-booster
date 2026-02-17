'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

<<<<<<< HEAD
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'Service', href: '/service' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
=======
  const navItems: { label: string; href: string; hasDropdown?: boolean; authOnly?: boolean }[] = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '#contact' },
    { label: 'Dashboard', href: '/dashboard', authOnly: true },
>>>>>>> bee5b828c97f472c69bb1102bc16a7f0f72b37d0
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.authOnly || isAuthenticated
  );

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
                  {item.hasDropdown && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
              </div>
            ))}

            {/* Auth Buttons */}
            {!isLoading && (
              isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-black font-medium text-sm transition-colors"
                >
                  Logout
                </button>
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
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="block w-full text-left py-3 text-gray-700 hover:text-black font-medium"
                >
                  Logout
                </button>
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
