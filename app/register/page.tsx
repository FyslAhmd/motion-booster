'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { registerSchema, formatZodErrors } from '@/lib/validators/auth';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { ZodError } from 'zod';
import { COUNTRY_CODES, type CountryCode } from '@/lib/data/country-codes';

// ─── Icon Components (defined outside to prevent re-creation) ───
const UserIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AtIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const EmailIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LockIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// ─── Eye Toggle Button Component ───
const EyeToggleButton = memo(({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button type="button" onClick={onToggle} className="focus:outline-none">
    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      )}
    </svg>
  </button>
));
EyeToggleButton.displayName = 'EyeToggleButton';

// ─── Input Field Component ───
const InputField = memo(({
  icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  rightElement,
  name,
  autoComplete,
}: {
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder: string;
  error?: string;
  rightElement?: React.ReactNode;
  name?: string;
  autoComplete?: string;
}) => (
  <div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full pl-12 ${rightElement ? 'pr-12' : 'pr-4'} py-3.5 border ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
        } rounded-full focus:outline-none focus:ring-2 transition-all text-sm`}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1 ml-4 text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
  </div>
));
InputField.displayName = 'InputField';

interface FieldErrors {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isBN = language === 'BN';

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

  // ─── Form state ─────────────────────────────────────
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // ─── UI state ───────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ─── Toggle handlers (memoized to prevent re-renders) ───
  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // ─── Password strength ─────────────────────────────
  const getPasswordStrength = (
    pw: string
  ): { level: number; label: string; color: string } => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { level: 1, label: isBN ? 'দুর্বল' : 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, label: isBN ? 'মাঝারি' : 'Medium', color: 'bg-yellow-500' };
    if (score <= 5) return { level: 3, label: isBN ? 'ভালো' : 'Good', color: 'bg-red-400' };
    return { level: 4, label: isBN ? 'শক্তিশালী' : 'Strong', color: 'bg-red-600' };
  };

  const passwordStrength = getPasswordStrength(password);

  // ─── Field-level validation on blur ─────────────────
  const validateField = useCallback((field: string, value: string | boolean) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field as keyof FieldErrors];
      return next;
    });

    if (field === 'username') {
      const v = value as string;
      if (v && v.length < 3)
        setFieldErrors((p) => ({
          ...p,
          username: isBN ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে' : 'Username must be at least 3 characters',
        }));
      else if (v && !/^[a-zA-Z0-9_]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          username: isBN
            ? 'ইউজারনেমে শুধু অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে'
            : 'Username can only contain letters, numbers, and underscore',
        }));
    }

    if (field === 'fullName') {
      const v = value as string;
      if (v && v.length < 2)
        setFieldErrors((p) => ({
          ...p,
          fullName: isBN ? 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' : 'Name must be at least 2 characters',
        }));
      else if (v && !/^[a-zA-Z\s'-]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          fullName: isBN
            ? 'নামে শুধু অক্ষর, স্পেস, হাইফেন ও অ্যাপোস্ট্রফি ব্যবহার করা যাবে'
            : 'Name can only contain letters, spaces, hyphen, and apostrophe',
        }));
    }

    if (field === 'email') {
      const v = value as string;
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          email: isBN ? 'সঠিক ইমেইল ঠিকানা লিখুন' : 'Please enter a valid email address',
        }));
    }

    if (field === 'phone') {
      const v = value as string;
      if (v && !/^\+?[0-9\s\-()]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          phone: isBN ? 'সঠিক ফোন নম্বর লিখুন' : 'Please enter a valid phone number',
        }));
      else if (v && v.replace(/\D/g, '').length < 7)
        setFieldErrors((p) => ({
          ...p,
          phone: isBN ? 'ফোন নম্বর কমপক্ষে ৭ ডিজিটের হতে হবে' : 'Phone number must be at least 7 digits',
        }));
    }

    if (field === 'password') {
      const v = value as string;
      if (v && v.length < 8)
        setFieldErrors((p) => ({
          ...p,
          password: isBN ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'Password must be at least 8 characters',
        }));
      if (confirmPassword && v !== confirmPassword) {
        setFieldErrors((p) => ({
          ...p,
          confirmPassword: isBN ? 'পাসওয়ার্ড মিলেনি' : 'Passwords do not match',
        }));
      } else if (confirmPassword) {
        setFieldErrors((p) => {
          const next = { ...p };
          delete next.confirmPassword;
          return next;
        });
      }
    }

    if (field === 'confirmPassword') {
      const v = value as string;
      if (v && v !== password)
        setFieldErrors((p) => ({
          ...p,
          confirmPassword: isBN ? 'পাসওয়ার্ড মিলেনি' : 'Passwords do not match',
        }));
    }
  }, [password, confirmPassword, isBN]);

  // ─── Submit handler ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');
    setSuccessMessage('');

    const fullPhone = selectedCountry
      ? `+${selectedCountry.dialCode}${phone.replace(/^0+/, '')}`
      : phone;

    const formData = {
      username,
      fullName,
      email,
      phone: fullPhone,
      password,
      confirmPassword,
      acceptTerms: acceptTerms as true,
    };

    try {
      registerSchema.parse(formData);
    } catch (error) {
      if (error instanceof ZodError) {
        setFieldErrors(formatZodErrors(error) as FieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.details?.fields) {
          setFieldErrors(data.error.details.fields as FieldErrors);
          return;
        }
        setServerError(data.error?.message || (isBN ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Registration failed. Please try again.'));
        return;
      }

      setSuccessMessage(data.message || (isBN ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!'));
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      setServerError(
        isBN
          ? 'নেটওয়ার্ক সমস্যা হয়েছে। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
          : 'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-md p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isBN ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isBN ? 'শুরু করতে আপনার তথ্য পূরণ করুন' : 'Fill in your details to get started'}
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <InputField
              icon={AtIcon}
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => validateField('username', username)}
              placeholder={isBN ? 'ইউজারনেম' : 'Username'}
              error={fieldErrors.username}
            />

            {/* Full Name */}
            <InputField
              icon={UserIcon}
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => validateField('fullName', fullName)}
              placeholder={isBN ? 'পূর্ণ নাম' : 'Full name'}
              error={fieldErrors.fullName}
            />

            {/* Email */}
            <InputField
              icon={EmailIcon}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateField('email', email)}
              placeholder={isBN ? 'ইমেইল ঠিকানা' : 'Email address'}
              error={fieldErrors.email}
            />

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
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <InputField
              icon={LockIcon}
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validateField('password', password)}
              placeholder={isBN ? 'পাসওয়ার্ড' : 'Password'}
              error={fieldErrors.password}
              rightElement={<EyeToggleButton show={showPassword} onToggle={toggleShowPassword} />}
            />

            {/* Password Strength Meter */}
            {password && (
              <div className="px-4">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordStrength.level >= i
                          ? passwordStrength.color
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs ${
                    passwordStrength.level <= 1
                      ? 'text-red-500'
                      : passwordStrength.level <= 2
                        ? 'text-yellow-600'
                        : passwordStrength.level <= 3
                          ? 'text-red-500'
                          : 'text-red-600'
                  }`}
                >
                  {passwordStrength.label}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <InputField
              icon={LockIcon}
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              placeholder={isBN ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm password'}
              error={fieldErrors.confirmPassword}
              rightElement={<EyeToggleButton show={showConfirmPassword} onToggle={toggleShowConfirmPassword} />}
            />

            {/* Terms & Conditions */}
            <div>
              <div className="flex items-center text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (e.target.checked) {
                        setFieldErrors((p) => {
                          const next = { ...p };
                          delete next.acceptTerms;
                          return next;
                        });
                      }
                    }}
                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-600">
                    {isBN ? 'আমি গ্রহণ করছি ' : 'I accept the '}
                    <Link
                      href="/terms"
                      className="text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      {isBN ? 'শর্তাবলি' : 'Terms & Conditions'}
                    </Link>
                  </span>
                </label>
              </div>
              {fieldErrors.acceptTerms && (
                <p className="mt-1 ml-4 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.acceptTerms}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isBN ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...'}
                </>
              ) : (
                isBN ? 'এখনই রেজিস্টার করুন' : 'Register Now'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-gray-600 text-sm">
            {isBN ? 'ইতোমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link
              href="/login"
              className="text-red-500 hover:text-red-600 font-semibold transition-colors"
            >
              {isBN ? 'লগইন করুন' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
