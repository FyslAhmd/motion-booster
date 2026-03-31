'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginSchema, formatZodErrors } from '@/lib/validators/auth';
import { useAuth } from '@/lib/auth/context';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { ZodError } from 'zod';
import { COUNTRY_CODES, type CountryCode } from '@/lib/data/country-codes';
import { toast } from 'sonner';

interface FieldErrors {
  phone?: string;
  password?: string;
}

interface LoginResponse {
  data?: {
    accessToken?: string;
    user?: Record<string, unknown> | null;
  };
  error?: {
    message?: string;
    details?: {
      fields?: FieldErrors;
    };
  };
  message?: string;
}

function isAuthUser(value: unknown): value is Parameters<ReturnType<typeof useAuth>['login']>[1] {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.fullName === 'string' &&
    typeof user.phone === 'string' &&
    typeof user.role === 'string'
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const isBN = language === 'BN';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ─── Country code state ─────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRY_CODES.find((c) => c.code === 'BD') || COUNTRY_CODES[0]
  );
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter((c) => {
    const q = countrySearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Field-level validation on blur ─────────────────
  const validateField = useCallback((field: string, value: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field as keyof FieldErrors];
      return next;
    });

    if (field === 'phone') {
      if (value && !/^\+?[0-9\s\-()]+$/.test(value))
        setFieldErrors((p) => ({
          ...p,
          phone: isBN ? 'সঠিক ফোন নম্বর লিখুন' : 'Please enter a valid phone number',
        }));
    }

    if (field === 'password') {
      if (!value)
        setFieldErrors((p) => ({
          ...p,
          password: isBN ? 'পাসওয়ার্ড দেওয়া বাধ্যতামূলক' : 'Password is required',
        }));
    }
  }, [isBN]);

  // ─── Submit handler ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');

    const fullPhone = selectedCountry
      ? `+${selectedCountry.dialCode}${phone.replace(/^0+/, '')}`
      : phone;

    const formData = { phone: fullPhone, password };

    try {
      loginSchema.parse(formData);
    } catch (error) {
      if (error instanceof ZodError) {
        setFieldErrors(formatZodErrors(error) as FieldErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data: LoginResponse | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        if (data?.error?.details?.fields) {
          setFieldErrors(data.error.details.fields as FieldErrors);
          return;
        }
        setServerError(
          data?.error?.message ||
            data?.message ||
            (isBN ? 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Login failed. Please try again.')
        );
        return;
      }

      // Store auth state and redirect
      if (data?.data?.accessToken && isAuthUser(data?.data?.user)) {
        login(data.data.accessToken, data.data.user);
      }

      toast.success(isBN ? 'লগইন সফল হয়েছে' : 'Login successful');

      // Redirect based on role
      const role = data?.data?.user?.role;
      router.push(role === 'ADMIN' ? '/dashboard' : '/dashboard/chat');
    } catch {
      setServerError(
        isBN
          ? 'নেটওয়ার্ক সমস্যা হয়েছে। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
          : 'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-8.625rem)] lg:min-h-[calc(100dvh-7.75rem)] bg-linear-to-br from-red-50 to-white flex items-center justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-md lg:mt-0">
        <div className="bg-white rounded-3xl shadow-md p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isBN ? 'অ্যাকাউন্টে লগইন করুন' : 'Login into account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isBN ? 'সাইন ইন করতে আপনার ফোন নম্বর ও পাসওয়ার্ড দিন' : 'Use your phone number and password to sign in'}
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Phone with Country Code Dropdown */}
            <div>
              <div className="relative flex" ref={countryDropdownRef}>
                {/* Country Code Selector */}
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`flex items-center gap-1.5 pl-3 pr-2 py-3.5 border ${
                    fieldErrors.phone
                      ? 'border-red-400'
                      : 'border-gray-300'
                  } rounded-l-full bg-gray-50 hover:bg-gray-100 transition-colors shrink-0`}
                >
                  <Image
                    src={selectedCountry.flag}
                    alt={selectedCountry.code}
                    width={20}
                    height={14}
                    className="rounded-sm object-cover"
                    style={{ height: 'auto' }}
                    unoptimized
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    +{selectedCountry.dialCode}
                  </span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Country Dropdown */}
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder={isBN ? 'দেশ খুঁজুন...' : 'Search country...'}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-red-400"
                        autoFocus
                      />
                    </div>
                    {/* Country List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCountries.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                          {isBN ? 'কোনো দেশ পাওয়া যায়নি' : 'No countries found'}
                        </div>
                      ) : (
                        filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountryDropdown(false);
                              setCountrySearch('');
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-50 transition-colors ${
                              selectedCountry.code === country.code ? 'bg-red-50 text-red-600' : 'text-gray-700'
                            }`}
                          >
                            <Image
                              src={country.flag}
                              alt={country.code}
                              width={22}
                              height={15}
                              className="rounded-sm object-cover shrink-0"
                              unoptimized
                            />
                            <span className="truncate flex-1 text-left">{country.name}</span>
                            <span className="text-gray-400 shrink-0">+{country.dialCode}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Phone Number Input */}
                <div className="relative flex-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => validateField('phone', phone)}
                    placeholder={isBN ? 'ফোন নম্বর' : 'Phone Number'}
                    className={`w-full pl-4 pr-4 py-3.5 border-y border-r ${
                      fieldErrors.phone
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                    } rounded-r-full focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                </div>
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 ml-4 text-xs text-red-500 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validateField('password', password)}
                  placeholder={isBN ? 'পাসওয়ার্ড' : 'Password'}
                  className={`w-full pl-12 pr-12 py-3.5 border ${
                    fieldErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                  } rounded-full focus:outline-none focus:ring-2 transition-all text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 ml-4 text-xs text-red-500 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-2 text-gray-600">{isBN ? 'আমাকে মনে রাখুন' : 'Remember me'}</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                {isBN ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isBN ? 'লগইন হচ্ছে...' : 'Signing In...'}
                </>
              ) : (
                isBN ? 'এখনই লগইন' : 'Login Now'
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-gray-600 text-sm">
            {isBN ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
            <Link
              href="/register"
              className="text-red-500 hover:text-red-600 font-semibold transition-colors"
            >
              {isBN ? 'রেজিস্টার করুন' : 'Register here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
