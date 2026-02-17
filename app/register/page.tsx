'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema, formatZodErrors } from '@/lib/validators/auth';
import { ZodError } from 'zod';

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

    if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 5) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // ─── Field-level validation on blur ─────────────────
  const validateField = (field: string, value: string | boolean) => {
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
          username: 'Username must be at least 3 characters',
        }));
      else if (v && !/^[a-zA-Z0-9_]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          username:
            'Username can only contain letters, numbers, and underscores',
        }));
    }

    if (field === 'fullName') {
      const v = value as string;
      if (v && v.length < 2)
        setFieldErrors((p) => ({
          ...p,
          fullName: 'Name must be at least 2 characters',
        }));
      else if (v && !/^[a-zA-Z\s'-]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          fullName: 'Name can only contain letters, spaces, hyphens, and apostrophes',
        }));
    }

    if (field === 'email') {
      const v = value as string;
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          email: 'Please enter a valid email address',
        }));
    }

    if (field === 'phone') {
      const v = value as string;
      if (v && !/^\+?[0-9\s\-()]+$/.test(v))
        setFieldErrors((p) => ({
          ...p,
          phone: 'Please enter a valid phone number',
        }));
      else if (v && v.replace(/\D/g, '').length < 7)
        setFieldErrors((p) => ({
          ...p,
          phone: 'Phone number must be at least 7 digits',
        }));
    }

    if (field === 'password') {
      const v = value as string;
      if (v && v.length < 8)
        setFieldErrors((p) => ({
          ...p,
          password: 'Password must be at least 8 characters',
        }));
      if (confirmPassword && v !== confirmPassword) {
        setFieldErrors((p) => ({
          ...p,
          confirmPassword: 'Passwords do not match',
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
          confirmPassword: 'Passwords do not match',
        }));
    }
  };

  // ─── Submit handler ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');
    setSuccessMessage('');

    const formData = {
      username,
      fullName,
      email,
      phone,
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
        setServerError(data.error?.message || 'Registration failed. Please try again.');
        return;
      }

      setSuccessMessage(data.message || 'Account created successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reusable input with error display ──────────────
  const InputField = ({
    icon,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    rightElement,
  }: {
    icon: React.ReactNode;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder: string;
    error?: string;
    rightElement?: React.ReactNode;
  }) => (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-12 ${rightElement ? 'pr-12' : 'pr-4'} py-3.5 border ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
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
  );

  // ─── Icons ──────────────────────────────────────────
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

  const EyeToggle = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} className="focus:outline-none">
      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {show ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        )}
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create an account
            </h1>
            <p className="text-gray-500 text-sm">
              Fill in your details to get started
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
            <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <InputField
              icon={AtIcon}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => validateField('username', username)}
              placeholder="Username"
              error={fieldErrors.username}
            />

            {/* Full Name */}
            <InputField
              icon={UserIcon}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => validateField('fullName', fullName)}
              placeholder="Full Name"
              error={fieldErrors.fullName}
            />

            {/* Email */}
            <InputField
              icon={EmailIcon}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateField('email', email)}
              placeholder="Email Address"
              error={fieldErrors.email}
            />

            {/* Phone */}
            <InputField
              icon={PhoneIcon}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => validateField('phone', phone)}
              placeholder="Phone Number (e.g. +880...)"
              error={fieldErrors.phone}
            />

            {/* Password */}
            <InputField
              icon={LockIcon}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validateField('password', password)}
              placeholder="Password"
              error={fieldErrors.password}
              rightElement={EyeToggle(showPassword, () => setShowPassword(!showPassword))}
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
                          ? 'text-blue-600'
                          : 'text-green-600'
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              placeholder="Confirm Password"
              error={fieldErrors.confirmPassword}
              rightElement={EyeToggle(showConfirmPassword, () =>
                setShowConfirmPassword(!showConfirmPassword)
              )}
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
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-600">
                    I accept the{' '}
                    <Link
                      href="/terms"
                      className="text-green-500 hover:text-green-600 font-medium transition-colors"
                    >
                      Terms & Conditions
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
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all transform hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-200 flex items-center justify-center gap-2"
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
                  Creating Account...
                </>
              ) : (
                'Register Now'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-green-500 hover:text-green-600 font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
