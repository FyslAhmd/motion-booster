'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/lang/LanguageContext';

export default function ForgotPasswordVerifyPage() {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const params = useSearchParams();
  const email = useMemo(() => (params.get('email') || '').trim().toLowerCase(), [params]);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');
  const [stage, setStage] = useState<'verify' | 'reset' | 'done'>('verify');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!email || typeof window === 'undefined') return;
    const token = sessionStorage.getItem(`forgot_password_reset_token:${email}`) || '';
    setResetToken(token);
    if (!token) {
      setError(isBN ? 'সেশন পাওয়া যায়নি। আবার OTP পাঠান।' : 'Reset session not found. Please request OTP again.');
    }
  }, [email, isBN]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp.trim() || !resetToken) return;

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          resetToken,
        }),
      });

      let payload: { error?: string; data?: { resetSessionToken?: string } } | null = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (!res.ok) {
        setError(payload?.error || (isBN ? 'OTP সঠিক নয় বা মেয়াদ শেষ।' : 'OTP is invalid or expired.'));
        return;
      }

      const sessionToken = payload?.data?.resetSessionToken;
      if (!sessionToken) {
        setError(isBN ? 'ভেরিফিকেশন সম্পন্ন হয়নি।' : 'Verification failed.');
        return;
      }

      setResetSessionToken(sessionToken);
      setStage('reset');
      setOtp('');
    } catch {
      setError(isBN ? 'নেটওয়ার্ক সমস্যা হয়েছে।' : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !resetSessionToken) return;

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
          resetSessionToken,
        }),
      });

      let payload: { error?: string } | null = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (!res.ok) {
        setError(payload?.error || (isBN ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Failed to reset password.'));
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`forgot_password_reset_token:${email}`);
      }

      setStage('done');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError(isBN ? 'নেটওয়ার্ক সমস্যা হয়েছে।' : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-10">
          {stage === 'verify' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {isBN ? 'কোড যাচাই' : 'Verify OTP'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isBN
                    ? `আমরা ${email || 'আপনার ইমেইলে'} OTP পাঠিয়েছি।`
                    : `We sent an OTP to ${email || 'your email'}.`}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D+/g, '').slice(0, 8))}
                  maxLength={8}
                  placeholder={isBN ? 'OTP লিখুন' : 'Enter OTP'}
                  className="w-full px-4 py-3.5 text-center tracking-[0.35em] text-lg border border-gray-300 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !resetToken}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-red-200"
                >
                  {isSubmitting ? (isBN ? 'যাচাই হচ্ছে...' : 'Verifying...') : (isBN ? 'OTP যাচাই করুন' : 'Verify OTP')}
                </button>
              </form>

              <div className="mt-8 text-center space-y-2">
                <Link href="/forgot-password" className="block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  {isBN ? 'আবার OTP পাঠান' : 'Resend OTP'}
                </Link>
                <Link href="/login" className="block text-gray-500 hover:text-gray-800 text-sm transition-colors">
                  {isBN ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </Link>
              </div>
            </>
          )}

          {stage === 'reset' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {isBN ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isBN ? 'আপনার অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড দিন।' : 'Enter a new password for your account.'}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isBN ? 'নতুন পাসওয়ার্ড' : 'New password'}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  required
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isBN ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm password'}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-red-200"
                >
                  {isSubmitting
                    ? (isBN ? 'রিসেট হচ্ছে...' : 'Resetting...')
                    : (isBN ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password')}
                </button>
              </form>
            </>
          )}

          {stage === 'done' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {isBN ? 'পাসওয়ার্ড রিসেট সম্পন্ন' : 'Password Reset Complete'}
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                {isBN ? 'এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' : 'Now log in using your new password.'}
              </p>

              <Link
                href="/login"
                className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
              >
                {isBN ? 'লগইনে যান' : 'Go to Login'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
