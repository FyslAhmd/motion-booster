'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { ServiceCategoryItem } from '@/lib/admin/store';
import { CategoryIcon } from '@/lib/admin/categoryIcons';
import { pickLocalizedText } from '@/lib/lang/localize';

const SERVICE_CATEGORIES_CACHE_KEY = 'serviceCategories:v1';
const SERVICE_CATEGORIES_TTL_MS = 5 * 60 * 1000;

let serviceCategoriesMemoryCache: {
  at: number;
  rows: ServiceCategoryItem[];
} | null = null;

function SkeletonCard() {
  return (
    <div className="shrink-0 flex flex-col items-center justify-center w-28 h-24 sm:w-36 sm:h-30 md:w-40 md:h-32 bg-white border border-gray-100 rounded-xl sm:rounded-2xl px-2 sm:px-4">
      {/* icon box */}
      <div className="mb-1.5 sm:mb-3 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gray-200 animate-pulse" />
      {/* title line */}
      <div className="h-2.5 w-14 sm:w-20 rounded-full bg-gray-200 animate-pulse" />
    </div>
  );
}

export const CategorySlider = () => {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);
  const dragMovedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();

    const hydrateFromCache = () => {
      if (serviceCategoriesMemoryCache && now - serviceCategoriesMemoryCache.at < SERVICE_CATEGORIES_TTL_MS) {
        setCategories(serviceCategoriesMemoryCache.rows);
        setLoading(false);
        return true;
      }

      try {
        const raw = sessionStorage.getItem(SERVICE_CATEGORIES_CACHE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as { at: number; rows: ServiceCategoryItem[] };

        if (!Array.isArray(parsed?.rows) || now - parsed.at >= SERVICE_CATEGORIES_TTL_MS) {
          return false;
        }

        serviceCategoriesMemoryCache = parsed;
        setCategories(parsed.rows);
        setLoading(false);
        return true;
      } catch {
        return false;
      }
    };

    const hasWarmCache = hydrateFromCache();
    if (!hasWarmCache) setLoading(true);

    fetch('/api/v1/cms/service-categories')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const payload = { at: Date.now(), rows: data as ServiceCategoryItem[] };
        serviceCategoriesMemoryCache = payload;
        try {
          sessionStorage.setItem(SERVICE_CATEGORIES_CACHE_KEY, JSON.stringify(payload));
        } catch {
          // Ignore storage quota/unavailable errors.
        }
        setCategories(payload.rows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-20 py-2 sm:py-3 lg:py-4 bg-white page-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-wave">
          {t('category_heading')}
        </h2>

        <div className="relative flex items-center">
          {loading ? (
            <div className="flex gap-2.5 sm:gap-4 overflow-x-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onPointerDown={(e) => {
                const el = scrollRef.current;
                if (!el) return;
                setIsDragging(true);
                dragMovedRef.current = false;
                setDragStartX(e.clientX);
                setDragStartScroll(el.scrollLeft);
              }}
              onPointerMove={(e) => {
                if (!isDragging) return;
                const el = scrollRef.current;
                if (!el) return;
                const delta = e.clientX - dragStartX;
                if (Math.abs(delta) > 4) dragMovedRef.current = true;
                el.scrollLeft = dragStartScroll - delta;
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerLeave={() => setIsDragging(false)}
            >
              {categories.map((category, index) => {
                const title = pickLocalizedText(language, category.title, category.titleBn);
                return (
                <div
                  key={category.id}
                  className={index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}
                  style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
                >
                  <Link
                    href={`/category/${category.slug}`}
                    onClick={(e) => {
                      if (!dragMovedRef.current) return;
                      e.preventDefault();
                      e.stopPropagation();
                      dragMovedRef.current = false;
                    }}
                    onDragStart={(e) => e.preventDefault()}
                    className="category-card group shrink-0 flex flex-col items-center justify-center w-28 h-24 sm:w-36 sm:h-30 md:w-40 md:h-32 bg-white border border-gray-100 rounded-xl sm:rounded-2xl hover:border-red-200 transition-all duration-300 px-2 sm:px-4"
                  >
                    <div
                      className={`mb-1.5 sm:mb-3 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${
                        category.logoImage ? 'bg-white border border-gray-100' : category.iconBg
                      }`}
                    >
                      {category.logoImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.logoImage}
                          alt={`${title} logo`}
                          className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                        />
                      ) : (
                        <CategoryIcon
                          iconType={category.iconType}
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${category.iconColor}`}
                        />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-red-500 text-center leading-tight transition-colors">
                      {title}
                    </span>
                  </Link>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
