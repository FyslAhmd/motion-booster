'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X, ChevronRight, Info, Users, Briefcase,
  HelpCircle, Phone, FileText, Image, MessageCircle,
  User, Globe, LogIn
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface MoreDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'About Us', icon: Info, href: '/about' },
  { label: 'Our Team', icon: Users, href: '/team' },
  { label: 'Our Services', icon: Briefcase, href: '/service' },
  { label: 'Blog', icon: FileText, href: '/blog' },
  { label: 'Portfolio', icon: Image, href: '/portfolio' },
  { label: 'FAQ', icon: HelpCircle, href: '/#faq' },
  { label: 'Contact Us', icon: Phone, href: '/contact' },
  { label: 'Privacy Policy', icon: FileText, href: '/privacy-policy' },
  { label: 'Feedback & Suggestions', icon: MessageCircle, href: '/contact?topic=feedback' },
];

export const MoreDrawer = ({ open, onClose }: MoreDrawerProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const userInitial = (user?.fullName || user?.username || user?.email || 'U').trim().charAt(0).toUpperCase();
  const userAvatarUrl = user?.avatarUrl?.trim() || '';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer - slides in from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white transition-transform duration-300 lg:hidden ${open ? 'translate-x-0 shadow-2xl pointer-events-auto' : '-translate-x-full shadow-none pointer-events-none'}`}
        style={{ width: '80vw', maxWidth: '320px', overflowY: 'auto' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile / Login area */}
        {isAuthenticated && user ? (
          <div className="flex flex-col items-center pt-10 pb-5 border-b border-gray-100">
            <Link href="/dashboard/profile" onClick={onClose} className="flex flex-col items-center">
              {userAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-red-400 object-cover mb-3 hover:border-red-500 transition-colors"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-red-500 to-pink-500 border-2 border-red-400 flex items-center justify-center mb-3 hover:border-red-500 transition-colors">
                  <span className="text-white font-bold text-xl">{userInitial}</span>
                </div>
              )}
              <h3 className="text-base font-bold text-gray-900">{user.fullName || user.username}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </Link>
            <div className="flex gap-2 mt-3">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="px-4 py-1.5 bg-red-500 text-white rounded-full text-xs font-semibold"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => { await logout(); onClose(); }}
                className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-xs font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center pt-10 pb-5 border-b border-gray-100 px-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Guest User</h3>
            <p className="text-xs text-gray-400 text-center mb-4">Login to access your profile and more features</p>
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-2 w-full justify-center bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </Link>
          </div>
        )}

        {/* Language */}
        <div className="px-4 border-b border-gray-100">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-red-500" />
              </div>
              <span className="font-semibold text-gray-800">Language</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs font-bold">
              <span className="px-2 py-0.5 bg-white rounded-full text-red-500 shadow-sm">বাং</span>
              <span className="px-2 py-0.5 text-gray-500">EN</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-2 divide-y divide-gray-100 pb-8">
          {menuItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center justify-between py-3.5 ${isActive ? 'bg-red-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? 'bg-red-500' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-red-500'}`} />
                  </div>
                  <span className={`font-semibold text-sm ${isActive ? 'text-red-500' : 'text-gray-800'}`}>{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
