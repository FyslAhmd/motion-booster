'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedText } from '@/lib/lang/localize';

interface PortfolioItem {
  id: string;
  title: string;
  titleBn?: string | null;
  category: string;
  categoryBn?: string | null;
  description: string;
  descriptionBn?: string | null;
  client: string;
  clientBn?: string | null;
  result: string;
  resultBn?: string | null;
  tags: string[];
  tagsBn?: string[];
  coverColor: string;
  coverImage?: string | null;
  featured: boolean;
}

export const Portfolio = () => {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [mobilePreviewId, setMobilePreviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/portfolio', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const availableCategories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const filteredItems = activeCategory === 'all' ? items.slice(0, 6) : items.filter(i => i.category === activeCategory).slice(0, 6);

  const getCategoryLabel = (categoryKey: string) => {
    const match = items.find((item) => item.category === categoryKey);
    return pickLocalizedText(language, match?.category || categoryKey, match?.categoryBn);
  };

  return (
    <section className="py-8 md:py-12 lg:py-10 bg-gray-50 page-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 text-wave">
            {isBN ? 'আমাদের পোর্টফোলিও' : 'Our Portfolio'}
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto text-wave">
            {isBN ? 'আমাদের সাম্প্রতিক প্রজেক্ট ও সাফল্যের গল্প দেখুন' : 'Explore our latest projects and success stories'}
          </p>
        </div>

        {/* Category Filter */}
        {!loading && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === category
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? (isBN ? 'সব' : 'All') : getCategoryLabel(category)}
            </button>
          ))}
        </div>
        )}

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`portfolio-skeleton-${i}`} className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="h-48 md:h-56 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
          {!loading && filteredItems.map((item, index) => {
            const title = pickLocalizedText(language, item.title, item.titleBn);
            const categoryLabel = pickLocalizedText(language, item.category, item.categoryBn);
            const description = pickLocalizedText(language, item.description, item.descriptionBn);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -34 : 34 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: Math.min(index * 0.08, 0.32) }}
                onClick={() => {
                  // Mobile: tap card to reveal Live Preview button.
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setMobilePreviewId((prev) => (prev === item.id ? null : item.id));
                  }
                }}
                className="portfolio-card group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Cover Image or Gradient */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${item.coverColor}`} />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Hover: live link button only */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      mobilePreviewId === item.id
                        ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <a
                      href="https://motionbooster.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isBN ? 'লাইভ প্রিভিউ' : 'Live Preview'}
                    </a>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-2">
                    {categoryLabel}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
          >
            {isBN ? 'সব প্রজেক্ট দেখুন' : 'View All Projects'}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
