'use client';

import { useAuth } from '@/lib/auth/context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Home,
  MessageSquare,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', href: '/dashboard/messages', badge: 3 },
    { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header - Website Name */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">
              <span className="text-red-500">Motion</span>
              <span className="text-black">Booster</span>
            </span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-gray-200 flex-col overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard">
            <div className="cursor-pointer">
              <span className="text-2xl font-bold">
                <span className="text-red-500">Motion</span>
                <span className="text-black">Booster</span>
              </span>
              <div className="text-xs text-gray-500 mt-1">Client Dashboard</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link key={index} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0 pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link key={index} href={item.href} className="relative">
                <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
