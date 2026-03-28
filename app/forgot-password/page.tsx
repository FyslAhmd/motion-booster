'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/lang/LanguageContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { language } = useLanguage();
  const isBN = language === 'BN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    router.push(`/forgot-password/verify?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {isBN ? 'পাসওয়ার্ড রিসেট' : 'Forgot Password'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isBN ? 'ইমেইল দিন, আমরা ভেরিফিকেশন কোড পাঠাব।' : 'Enter your email to receive a verification code.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isBN ? 'ইমেইল ঠিকানা' : 'Email address'}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              {isBN ? 'কোড পাঠান' : 'Send Code'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {isBN ? 'লগইনে ফিরে যান' : 'Back to login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
