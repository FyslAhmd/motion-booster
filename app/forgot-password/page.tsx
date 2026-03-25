'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/lang/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language } = useLanguage();
  const isBN = language === 'BN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Reset Password Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {isBN ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isBN ? 'পাসওয়ার্ড রিসেট লিংক পেতে আপনার ইমেইল দিন।' : 'Enter your email to receive a password reset link.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
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
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  />
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-purple-200"
                >
                  {isBN ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
                </button>
              </form>

              {/* Back to Login */}
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
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {isBN ? 'আপনার ইমেইল চেক করুন' : 'Check your email'}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {isBN ? (
                    <>আমরা <strong>{email}</strong> ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি</>
                  ) : (
                    <>We sent a password reset link to <strong>{email}</strong></>
                  )}
                </p>
                <p className="text-gray-500 text-sm mb-8">
                  {isBN ? 'ইমেইল পাননি? স্প্যাম ফোল্ডার দেখুন অথবা ' : "Didn't get the email? Check spam or "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {isBN ? 'আবার চেষ্টা করুন' : 'try again'}
                  </button>
                </p>
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors"
                >
                  {isBN ? 'লগইনে ফিরে যান' : 'Back to login'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
