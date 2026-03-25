'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, User, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';

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

export default function PortfolioPage() {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    fetch('/api/v1/cms/portfolio', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, [language]);

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  const getCategoryLabel = (key: string) => {
    const match = items.find((item) => item.category === key);
    return pickLocalizedText(language, match?.category || key, match?.categoryBn);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-10 lg:pt-22 lg:pb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            {isBN ? 'আমাদের প্রজেক্টসমূহ' : 'Our Projects'}
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl">
            {isBN
              ? 'ওয়েব ডেভেলপমেন্ট, মোবাইল অ্যাপ, ডিজিটাল মার্কেটিং থেকে ব্র্যান্ড ডিজাইন পর্যন্ত আমাদের সম্পূর্ণ কাজ দেখুন।'
              : 'Explore our work across web development, mobile apps, digital marketing, and brand design.'}
          </p>
          <p className="mt-3 text-sm text-gray-400">
            {isBN
              ? `${categories.length - 1}টি ক্যাটাগরিতে ${items.length}টি প্রজেক্ট`
              : `${items.length} projects across ${categories.length - 1} categories`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 md:pt-6 md:pb-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                ? 'bg-red-500 text-white shadow-md shadow-red-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {cat === 'all' ? (isBN ? 'সব' : 'All') : getCategoryLabel(cat)}
              {cat !== 'all' && (
                <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-red-200' : 'text-gray-400'}`}>
                  ({items.filter(i => i.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {filtered.map(item => {
            const title = pickLocalizedText(language, item.title, item.titleBn);
            const categoryLabel = pickLocalizedText(language, item.category, item.categoryBn);
            const description = pickLocalizedText(language, item.description, item.descriptionBn);
            const tags = pickLocalizedList(language, item.tags, item.tagsBn);
            return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Cover */}
              <div className="relative h-40 md:h-44 overflow-hidden">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className={`w-full h-full bg-linear-to-br ${item.coverColor}`} />
                )}
                {item.featured && (
                  <span className="absolute top-3 left-3 bg-white/90 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {isBN ? 'ফিচার্ড' : 'Featured'}
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {categoryLabel}
                </span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                  {description}
                </p>
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{tags.length - 3}</span>
                  )}
                </div>
              </div>
            </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">
              {isBN ? 'এই ক্যাটাগরিতে এখনো কোনো প্রজেক্ট নেই।' : 'No projects in this category yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Cover */}
            <div className="relative h-52 sm:h-64 rounded-t-2xl overflow-hidden">
              {selected.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.coverImage}
                  alt={pickLocalizedText(language, selected.title, selected.titleBn)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-linear-to-br ${selected.coverColor}`} />
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors text-lg leading-none"
              >
                ×
              </button>
              <span className="absolute bottom-3 left-4 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                {pickLocalizedText(language, selected.category, selected.categoryBn)}
              </span>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 leading-snug">
                  {pickLocalizedText(language, selected.title, selected.titleBn)}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {pickLocalizedText(language, selected.description, selected.descriptionBn)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                  <User className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{isBN ? 'ক্লায়েন্ট' : 'Client'}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {pickLocalizedText(language, selected.client, selected.clientBn)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-green-50 rounded-xl p-3">
                  <TrendingUp className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{isBN ? 'ফলাফল' : 'Result'}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {pickLocalizedText(language, selected.result, selected.resultBn)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{isBN ? 'প্রযুক্তি' : 'Technologies'}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pickLocalizedList(language, selected.tags, selected.tagsBn).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/contact"
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  {isBN ? 'একই ধরনের প্রজেক্ট শুরু করুন' : 'Start a similar project'}
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
                >
                  {isBN ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
