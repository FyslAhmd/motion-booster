'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ServiceCategoryItem } from '@/lib/admin/store';
import { CategoryIcon } from '@/lib/admin/categoryIcons';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/service-categories')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-20 py-2 sm:py-3 lg:py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Our Service
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
              className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="category-card group shrink-0 flex flex-col items-center justify-center w-28 h-24 sm:w-36 sm:h-30 md:w-40 md:h-32 bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 px-2 sm:px-4"
                >
                  <div className={`mb-1.5 sm:mb-3 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${category.iconBg}`}>
                    <CategoryIcon
                      iconType={category.iconType}
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${category.iconColor}`}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-red-500 text-center leading-tight transition-colors">
                    {category.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
