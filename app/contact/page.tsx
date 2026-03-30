'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageSquare, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { useLanguage } from '@/lib/lang/LanguageContext';

type ContactFormData = {
  fullName: string;
  email: string;
  companyName: string;
  mobile: string;
  queryDetails: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

export default function ContactPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isBN = language === 'BN';
  const chatHref = isAuthenticated ? '/dashboard/chat' : '/login?next=%2Fdashboard%2Fchat';
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    companyName: '',
    mobile: '',
    queryDetails: ''
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const handleEmailIconClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const email = 'hello@motionbooster.com';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (!isAndroid && !isIOS) return;

    e.preventDefault();

    if (isAndroid) {
      window.location.href = `intent://compose?to=${encodeURIComponent(email)}#Intent;scheme=mailto;package=com.google.android.gm;end`;
      window.setTimeout(() => {
        window.location.href = `mailto:${email}`;
      }, 350);
      return;
    }

    window.location.href = `googlegmail://co?to=${encodeURIComponent(email)}`;
    window.setTimeout(() => {
      window.location.href = `mailto:${email}`;
    }, 350);
  };

  const validateField = (name: keyof ContactFormData, value: string): string => {
    const trimmed = value.trim();

    if (name === 'fullName') {
      if (trimmed.length < 2) return isBN ? 'পূর্ণ নাম কমপক্ষে ২ অক্ষরের হতে হবে।' : 'Full name must be at least 2 characters.';
      if (trimmed.length > 120) return isBN ? 'পূর্ণ নামটি খুব বড় হয়েছে।' : 'Full name is too long.';
      return '';
    }

    if (name === 'email') {
      if (!trimmed) return isBN ? 'ইমেইল দেওয়া বাধ্যতামূলক।' : 'Email is required.';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmed)) return isBN ? 'সঠিক ইমেইল ঠিকানা লিখুন।' : 'Please enter a valid email address.';
      if (trimmed.length > 255) return isBN ? 'ইমেইলটি খুব বড় হয়েছে।' : 'Email is too long.';
      return '';
    }

    if (name === 'companyName') {
      if (trimmed.length > 255) return isBN ? 'কোম্পানির নামটি খুব বড় হয়েছে।' : 'Company name is too long.';
      return '';
    }

    if (name === 'mobile') {
      if (trimmed.length < 6) return isBN ? 'মোবাইল নম্বর দেওয়া বাধ্যতামূলক।' : 'Mobile number is required.';
      if (trimmed.length > 40) return isBN ? 'মোবাইল নম্বরটি খুব বড় হয়েছে।' : 'Mobile number is too long.';
      return '';
    }

    if (name === 'queryDetails') {
      if (trimmed.length < 10) return isBN ? 'বার্তাটি কমপক্ষে ১০ অক্ষরের হতে হবে।' : 'Message must be at least 10 characters.';
      if (trimmed.length > 2000) return isBN ? 'বার্তাটি খুব বড় হয়েছে।' : 'Message is too long.';
      return '';
    }

    return '';
  };

  const validateForm = (): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};
    (Object.keys(formData) as Array<keyof ContactFormData>).forEach((key) => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) nextErrors[key] = fieldError;
    });
    return nextErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const field = name as keyof ContactFormData;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) || undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as keyof ContactFormData;
    const fieldError = validateField(field, e.target.value);
    setErrors((prev) => ({ ...prev, [field]: fieldError || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(isBN ? 'হাইলাইট করা ফিল্ডগুলো ঠিক করে আবার চেষ্টা করুন।' : 'Please fix the highlighted fields and try again.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        toast.error(result.error || (isBN ? 'আপনার বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।' : 'Could not send your message. Please try again.'));
        return;
      }

      toast.success(result.message || (isBN ? 'বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শিগগিরই যোগাযোগ করব।' : 'Message sent successfully. We will contact you soon.'));
      setFormData({
        fullName: '',
        email: '',
        companyName: '',
        mobile: '',
        queryDetails: '',
      });
    } catch {
      toast.error(isBN ? 'এই মুহূর্তে বার্তা পাঠানো সম্ভব হচ্ছে না। একটু পরে আবার চেষ্টা করুন।' : 'Unable to send message right now. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-[calc(2.8rem+env(safe-area-inset-bottom))] lg:pb-0">

      {/* Hero */}
      <section className="pt-10 pb-10 md:pt-40 md:pb-14 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center page-reveal">
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-4 lg:hidden">
            {isBN ? 'যোগাযোগ' : 'Contact'}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-wave">
            {isBN ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in touch with us'}
          </h1>
          <p className="text-gray-600 mb-6 md:mb-10 max-w-2xl mx-auto text-wave">
            {isBN
              ? 'কোনো প্রশ্ন আছে বা সহায়তা দরকার? আমাদের জানান, আমরা আনন্দের সাথে সাহায্য করব।'
              : 'Have any questions or need support? Let us know, we will be happy to help.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all card-reveal-left page-delay-1">
              <a
                href="tel:+8801790939394"
                aria-label={isBN ? 'ফোনে কল করুন' : 'Call on phone'}
                className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-5"
              >
                <Phone className="w-7 h-7 text-white" />
              </a>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isBN ? 'ফোন করুন' : 'Call us'}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="text-red-500 font-semibold">+880 1790-939394</span><br />
                {isBN ? 'সোম–শুক্র, সকাল ৯টা থেকে সন্ধ্যা ৬টা' : 'Mon-Fri, 9:00 AM to 6:00 PM'}
              </p>
            </div>

            <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all card-reveal-right page-delay-2">
              <a
                href="mailto:hello@motionbooster.com"
                onClick={handleEmailIconClick}
                aria-label={isBN ? 'জিমেইল কম্পোজ খুলুন' : 'Open Gmail compose'}
                className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-5"
              >
                <Mail className="w-7 h-7 text-white" />
              </a>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isBN ? 'ইমেইল করুন' : 'Email us'}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                <a href="mailto:hello@motionbooster.com" className="text-red-500 font-semibold hover:text-red-600 transition-colors">
                  hello@motionbooster.com
                </a><br />
                {isBN ? 'আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই' : 'We usually reply within 24 hours'}
              </p>
            </div>

            <div className="bg-white p-5 md:p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all card-reveal-left page-delay-3">
              <Link
                href={chatHref}
                aria-label={isBN ? 'লাইভ চ্যাট খুলুন' : 'Open live chat'}
                className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-5"
              >
                <MessageSquare className="w-7 h-7 text-white" />
              </Link>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isBN ? 'লাইভ চ্যাট' : 'Live chat'}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isBN ? 'আমাদের টিমের সাথে চ্যাট করুন' : 'Chat with our team'}<br />
                {isBN ? 'সোম–শুক্র, সকাল ৯টা থেকে সন্ধ্যা ৬টা' : 'Mon-Fri, 9:00 AM to 6:00 PM'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map + Form */}
      <section className="pt-8 pb-2 md:pt-12 md:pb-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">

          {/* Map Block */}
          <div className="space-y-4 page-reveal page-delay-1">
            <div>
              <p className="text-red-500 uppercase tracking-wider text-sm font-semibold mb-2">{isBN ? 'আমাদের অবস্থান' : 'Our location'}</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-3 text-wave">{isBN ? 'ম্যাপে আমাদের খুঁজুন' : 'Find us on map'}</h2>
              <p className="text-gray-500 text-sm">
                {isBN
                  ? 'আমাদের অফিস নিউ মার্কেট, ঢাকা-১২০৫, বাংলাদেশে। খোলা থাকে সোমবার থেকে শুক্রবার, সকাল ৯টা থেকে সন্ধ্যা ৬টা।'
                  : 'Our office is in New Market, Dhaka-1205, Bangladesh. Open Monday to Friday, 9:00 AM to 6:00 PM.'}
              </p>
            </div>

            {/* Stylized Map Card */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-gray-50" style={{ height: '340px' }}>
              {/* Embedded Google Map */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2783970255024!2d90.38493427601946!3d23.733889778702644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8eef3c90e8b%3A0x7b5d9e8b1f204c49!2sNew%20Market%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1708700000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={isBN ? 'মোশন বুস্টার অবস্থান' : 'Motion Booster location'}
              />

              {/* Floating info card on map */}
              <a
                href="https://maps.app.goo.gl/gLuPnr3LnoiqzyDH7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isBN ? 'গুগল ম্যাপে Motion Booster লোকেশন খুলুন' : 'Open Motion Booster location in Google Maps'}
                className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Motion Booster</p>
                  <p className="text-gray-500 text-xs">
                    {isBN ? 'নিউ মার্কেট, ঢাকা-১২০৫, বাংলাদেশ।' : 'New Market, Dhaka-1205, Bangladesh.'}
                  </p>
                </div>
              </a>
            </div>

            {/* Info rows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">{isBN ? 'ঠিকানা' : 'Address'}</p>
                  <p className="text-sm font-semibold text-gray-800">{isBN ? 'নিউ মার্কেট, ঢাকা-১২০৫, বাংলাদেশ।' : 'New Market, Dhaka-1205, Bangladesh.'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                <Clock className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">{isBN ? 'অফিস সময়' : 'Office hours'}</p>
                  <p className="text-sm font-semibold text-gray-800">{isBN ? 'সোম–শুক্র, সকাল ৯টা–৬টা' : 'Mon-Fri, 9:00 AM-6:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 card-reveal-right page-delay-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{isBN ? 'বার্তা পাঠান' : 'Send us a message'}</h3>
            <p className="text-gray-500 text-sm mb-6">
              {isBN
                ? 'ফর্মটি পূরণ করুন, আমরা ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব।'
                : 'Fill up the form and we will contact you within 24 hours.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">{isBN ? 'পূর্ণ নাম*' : 'Full name*'}</label>
                  <input
                    type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required
                    placeholder={isBN ? 'আপনার নাম' : 'Your name'}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-100'} focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">{isBN ? 'ইমেইল*' : 'Email*'}</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-100'} focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">{isBN ? 'কোম্পানির নাম' : 'Company name'}</label>
                  <input
                    type="text" name="companyName" value={formData.companyName} onChange={handleChange} onBlur={handleBlur}
                    placeholder={isBN ? 'আপনার কোম্পানি' : 'Your company'}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-100'} focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                  {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">{isBN ? 'মোবাইল*' : 'Mobile*'}</label>
                  <input
                    type="tel" name="mobile" value={formData.mobile} onChange={handleChange} onBlur={handleBlur} required
                    placeholder="+880 1xxx-xxxxxx"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.mobile ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-100'} focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                  {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1.5">{isBN ? 'বার্তা*' : 'Message*'}</label>
                <textarea
                  name="queryDetails" value={formData.queryDetails} onChange={handleChange} onBlur={handleBlur} required rows={5}
                  placeholder={isBN ? 'কীভাবে সাহায্য করতে পারি লিখুন...' : 'Write how we can help you...'}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.queryDetails ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-100'} focus:outline-none focus:ring-2 transition-all resize-none text-sm`}
                />
                {errors.queryDetails && <p className="mt-1 text-xs text-red-600">{errors.queryDetails}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow hover:shadow-lg"
              >
                {submitting ? (isBN ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBN ? 'বার্তা পাঠান' : 'Send message')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
