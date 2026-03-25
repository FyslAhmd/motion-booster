'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { PopularServiceItem } from '@/lib/admin/store';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';

export const PopularCourses = () => {
  const { t, language } = useLanguage();
  const isBN = language === 'BN';
  const [allServices, setAllServices] = useState<PopularServiceItem[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const [servicesResult, categoriesResult] = await Promise.allSettled([
        fetch('/api/v1/cms/popular-services', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/v1/cms/service-categories', { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (!cancelled && servicesResult.status === 'fulfilled' && Array.isArray(servicesResult.value)) {
        setAllServices(servicesResult.value);
      }

      if (!cancelled && categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
        const nextMap: Record<string, string> = {};
        categoriesResult.value.forEach((cat: { title?: string; titleBn?: string; slug?: string; iconType?: string }) => {
          const title = pickLocalizedText(language, cat.title, cat.titleBn);
          if (!title) return;
          [cat.slug, cat.iconType, cat.title].forEach((key) => {
            if (!key?.trim()) return;
            nextMap[key] = title;
            nextMap[key.toLowerCase()] = title;
          });
        });
        setCategoryLabels(nextMap);
      }

      if (!cancelled) setLoading(false);
    };

    load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const tabs = ['All', ...Array.from(new Set(allServices.map(s => s.category).filter(Boolean)))];

  const humanize = (value: string) =>
    value
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const getTabLabel = (value: string) =>
    categoryLabels[value] || categoryLabels[value.toLowerCase()] || humanize(value);

  const filteredServices = activeTab === 'All'
    ? allServices
    : allServices.filter(s => s.category === activeTab);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tab: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tab);
    event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <section className="pt-2 pb-6 md:py-8 lg:py-9 bg-white page-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 text-wave">
            {t('popular_heading')}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-4 text-wave">
            {t('popular_subtext')}
          </p>
        </div>

        {/* Tabs */}
        {!loading && (
        <div className="mb-8 md:mb-10">
          <div ref={tabsScrollRef} className="flex gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth border-b border-gray-200 pb-3 sm:pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={e => handleTabClick(tab, e)}
                className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                  activeTab === tab ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'All' ? t('popular_tab_all') : getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Cards + Arrows */}
        <div className="relative px-0 sm:px-8">
          <button onClick={() => scroll('left')} className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-red-200 bg-white text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-500 items-center justify-center transition-all shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div ref={scrollRef} className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 px-1 sm:px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="shrink-0 w-72 sm:w-80 md:w-85 bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-40 sm:h-48 w-full bg-gray-200 animate-pulse" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
            {!loading && filteredServices.map((service, index) => {
              const title = pickLocalizedText(language, service.title, service.titleBn);
              const description = pickLocalizedText(language, service.description, service.descriptionBn);
              const serviceItems = pickLocalizedList(language, service.services, service.servicesBn);
              return (
              <div
                key={service.id}
                className={`service-card shrink-0 w-72 sm:w-80 md:w-85 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
                style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
              >
                <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                  {service.customImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={service.customImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Image
                      src={service.image}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, 340px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">{description}</p>
                  <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
                    {serviceItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-2.5">
                        <div className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/category/${service.slug}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors group/link">
                    {isBN ? 'আরও জানুন' : 'Read More'}
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>

          <button onClick={() => scroll('right')} className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-red-200 bg-white text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-500 items-center justify-center transition-all shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
