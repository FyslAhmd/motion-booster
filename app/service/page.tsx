'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { CategoryIcon } from '@/lib/admin/categoryIcons';
import { ServiceCategoryListSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';
import { useAuth } from '@/lib/auth/context';

interface PopularServiceItem {
  id: string;
  title: string;
  titleBn?: string | null;
  description: string;
  descriptionBn?: string | null;
  gradient: string;
  category: string;
  categoryBn?: string | null;
  services: string[];
  servicesBn?: string[];
}

interface ServiceCategoryProps {
  iconType: string;
  title: string;
  description: string;
  services: string[];
  ctaLabel: string;
  ctaHref: string;
  tone: {
    cardBg: string;
    iconBg: string;
    iconColor: string;
    border: string;
  };
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ iconType, title, description, services, ctaLabel, ctaHref, tone }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${tone.border}`}>
      <div
        className={`p-6 cursor-pointer ${tone.cardBg}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="shrink-0">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${tone.iconBg}`}>
                <CategoryIcon iconType={iconType} className={`w-8 h-8 ${tone.iconColor}`} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
            </div>
          </div>
          <button className={`ml-4 mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-2 text-gray-700">
                <Check className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <span className="text-sm">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="px-6 pb-5 pt-2 flex justify-center bg-gray-50">
          <Link
            href={ctaHref}
            className="inline-flex min-w-40 items-center justify-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </div>
  );
};

export default function ServicePage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isBN = language === 'BN';
  const [serviceCategories, setServiceCategories] = useState<PopularServiceItem[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const getStartedHref = isAuthenticated ? '/dashboard' : '/login';

  useEffect(() => {
    fetch('/api/v1/cms/popular-services', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setServiceCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setServiceLoading(false));
  }, [language]);

  const lightTones = [
    { cardBg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-100' },
    { cardBg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', border: 'border-amber-100' },
    { cardBg: 'bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-700', border: 'border-sky-100' },
    { cardBg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', border: 'border-emerald-100' },
    { cardBg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-700', border: 'border-violet-100' },
  ] as const;

  const processSteps = isBN
    ? [
        { step: '০১', title: 'ডিসকভারি', desc: 'আপনার লক্ষ্য ও চাহিদা বোঝা' },
        { step: '০২', title: 'প্ল্যানিং', desc: 'স্ট্র্যাটেজি তৈরি ও রোডম্যাপ নির্ধারণ' },
        { step: '০৩', title: 'প্রোডাকশন', desc: 'নিয়মিত আপডেটসহ এজাইল ডেভেলপমেন্ট' },
        { step: '০৪', title: 'লঞ্চ', desc: 'টেস্টিং, ডিপ্লয়মেন্ট ও লাইভ সাপোর্ট' },
        { step: '০৫', title: 'সাপোর্ট', desc: 'নিরবচ্ছিন্ন রক্ষণাবেক্ষণ ও অপ্টিমাইজেশন' },
      ]
    : [
        { step: '01', title: 'Discovery', desc: 'Understanding your goals and requirements' },
        { step: '02', title: 'Planning', desc: 'Building strategy and delivery roadmap' },
        { step: '03', title: 'Production', desc: 'Agile development with regular updates' },
        { step: '04', title: 'Launch', desc: 'Testing, deployment and live support' },
        { step: '05', title: 'Support', desc: 'Ongoing maintenance and optimization' },
      ];

  return (
    <main className="min-h-screen bg-gray-50 pt-0 md:pt-0">
      {/* Hero Section */}
      <section className="pt-5 pb-10 md:pt-40 md:pb-14 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-4xl mx-auto page-reveal">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 leading-tight">
              {isBN ? 'সম্পূর্ণ ডিজিটাল সমাধান' : 'Complete Digital Solutions'}
              <span className="block text-red-600 text-3xl lg:text-5xl">
                {isBN ? 'এক ছাদের নিচে' : 'Under one roof'}
              </span>
            </h1>
            <p className="text-base md:text-2xl text-gray-600 leading-relaxed mb-8 text-wave">
              {isBN
                ? 'স্ট্র্যাটেজি থেকে এক্সিকিউশন পর্যন্ত, আপনার ব্যবসার জন্য কাস্টমাইজড এন্ড-টু-এন্ড সার্ভিসে আমরা ডিজিটাল উপস্থিতি গড়ে তুলি ও সম্প্রসারণ করি।'
                : 'From strategy to execution, we build and scale your digital presence with tailored end-to-end services.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={getStartedHref}
                className="inline-flex items-center justify-center text-center px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
              >
                {isBN ? 'শুরু করুন' : 'Get Started'}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center text-center px-6 py-3 bg-white text-gray-900 rounded-full font-semibold border-2 border-gray-200 hover:border-red-500 hover:text-red-600 transition-colors"
              >
                {isBN ? 'আরও জানুন' : 'Learn More'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-4 md:py-8 bg-white">
        <div className="max-w-7xl mx-auto lg:px-8">
          <div className="text-center mb-4 page-reveal page-delay-1">
            <h2 className="px-6 text-2xl lg:text-5xl font-bold text-gray-900 mb-4">
              {isBN ? 'আমাদের সেবাসমূহ' : 'Our Services'}
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {isBN
                ? 'আমরা কী কী সেবা দিই তা দেখতে যেকোনো ক্যাটাগরিতে ক্লিক করুন'
                : 'Click any category to explore what we offer'}
            </p>
          </div>

          {serviceLoading ? (
            <ServiceCategoryListSkeleton />
          ) : (
            <div className="space-y-6">
              {serviceCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={`${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'} mx-auto w-[88%] md:w-full`}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <ServiceCategory
                    iconType={category.category}
                    title={pickLocalizedText(language, category.title, category.titleBn)}
                    description={pickLocalizedText(language, category.description, category.descriptionBn)}
                    services={pickLocalizedList(language, category.services, category.servicesBn)}
                    ctaLabel={isBN ? 'শুরু করুন' : 'Get Started'}
                    ctaHref={getStartedHref}
                    tone={lightTones[index % lightTones.length]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="pt-12 pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pt-12 lg:pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 page-reveal page-delay-2">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {isBN ? 'আমাদের প্রক্রিয়া' : 'Our Process'}
            </h2>
            <p className="text-xl text-gray-600 text-wave">
              {isBN ? 'যেভাবে আমরা সেরা ফলাফল দিই' : 'How we deliver the best outcomes'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {processSteps.map((item, index) => (
              <div key={index} className={index % 2 === 0 ? 'text-center card-reveal-left' : 'text-center card-reveal-right'} style={{ animationDelay: `${index * 80}ms` }}>
                <div className="w-20 h-20 bg-red-500 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
