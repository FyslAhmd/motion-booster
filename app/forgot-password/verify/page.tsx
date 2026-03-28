'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/lang/LanguageContext';

export default function ForgotPasswordVerifyPage() {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const params = useSearchParams();
  const email = useMemo(() => params.get('email') || '', [params]);

  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-10">
          {!isVerified ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {isBN ? 'কোড যাচাই' : 'Verify Code'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isBN
                    ? `আমরা ${email || 'আপনার ইমেইলে'} একটি কোড পাঠিয়েছি।`
                    : `We sent a verification code to ${email || 'your email'}.`}
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\s+/g, ''))}
                  maxLength={8}
                  placeholder={isBN ? 'কোড লিখুন' : 'Enter code'}
                  className="w-full px-4 py-3.5 text-center tracking-[0.35em] text-lg border border-gray-300 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-red-200"
                >
                  OK
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/forgot-password" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  {isBN ? 'আগের পেজে যান' : 'Back'}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {isBN ? 'সফলভাবে সম্পন্ন হয়েছে' : 'Successfully Completed'}
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                {isBN ? 'কোড যাচাই সফল হয়েছে।' : 'Code verification was successful.'}
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
