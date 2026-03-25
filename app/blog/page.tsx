'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogContentSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';

interface BlogPost {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  excerpt: string;
  excerptBn?: string | null;
  content: string;
  contentBn?: string | null;
  coverImage: string | null;
  category: string;
  categoryBn?: string | null;
  tags: string[];
  tagsBn?: string[];
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

function formatDate(iso: string, locale: 'bn-BD' | 'en-US') {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const locale = isBN ? 'bn-BD' : 'en-US';
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileTags, setShowMobileTags] = useState(false);
  const [showMobileLatest, setShowMobileLatest] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/blog', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const published = (Array.isArray(data) ? data : []).filter(
          (p: BlogPost) => p.status === 'PUBLISHED'
        );
        setAllPosts(published);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const categories = ['all', ...Array.from(new Set(allPosts.map(p => p.category).filter(Boolean)))];
  const allTags = Array.from(new Set(allPosts.flatMap((p) => pickLocalizedList(language, p.tags, p.tagsBn))));
  const latestPosts = [...allPosts].slice(0, 4);
  const getCategoryLabel = (key: string) => {
    const post = allPosts.find((item) => item.category === key);
    return pickLocalizedText(language, post?.category || key, post?.categoryBn);
  };
  const categoryCounts = useMemo(
    () =>
      categories.reduce<Record<string, number>>((acc, category) => {
        acc[category] =
          category === 'all'
            ? allPosts.length
            : allPosts.filter((post) => post.category === category).length;
        return acc;
      }, {}),
    [categories, allPosts]
  );

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const title = pickLocalizedText(language, post.title, post.titleBn).toLowerCase();
    const excerpt = pickLocalizedText(language, post.excerpt, post.excerptBn).toLowerCase();
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      excerpt.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white pb-16 lg:pb-0">
      {/* Header Section */}
      <section className="pt-12 sm:pt-18 md:pt-22 lg:pt-26 pb-5 sm:pb-7 lg:pb-9 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center page-reveal">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {isBN ? 'সর্বশেষ ইনসাইটস ও ' : 'Latest Insights & '}
            <span className="text-red-600">{isBN ? 'আপডেট' : 'Updates'}</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base text-wave">
            {isBN
              ? 'ব্যবসা বাড়ানোর জন্য দরকারি ট্রেন্ড, টিপস ও ইনসাইটস নিয়ে আমাদের সর্বশেষ আর্টিকেলগুলো দেখুন।'
              : 'Explore our latest articles on trends, tips, and insights to help grow your business.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-3 pb-8 sm:pt-5 sm:pb-10 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <BlogContentSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {/* Blog Posts Grid */}
              <div className="order-2 lg:order-2 lg:col-span-3">

                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {filteredPosts.map((post, index) => {
                      const title = pickLocalizedText(language, post.title, post.titleBn);
                      const excerpt = pickLocalizedText(language, post.excerpt, post.excerptBn);
                      const category = pickLocalizedText(language, post.category, post.categoryBn);
                      const tags = pickLocalizedList(language, post.tags, post.tagsBn);

                      return (
                        <article
                          key={post.id}
                          className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
                          style={{ animationDelay: `${index * 70}ms` }}
                        >
                          <div className="relative h-44 sm:h-48 bg-red-50">
                            {post.coverImage ? (
                              <Image
                                src={post.coverImage}
                                alt={title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-gray-300 text-sm">{isBN ? 'কোনো ছবি নেই' : 'No image available'}</div>
                              </div>
                            )}
                            {post.category && (
                              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {category}
                              </span>
                            )}
                          </div>

                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 mb-2.5 sm:mb-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {isBN ? 'লেখক' : 'Author'}: {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.createdAt, locale)}
                              </span>
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5 sm:mb-3 line-clamp-2">
                              {title}
                            </h2>

                            <p className="text-gray-600 text-sm mb-3.5 sm:mb-4 line-clamp-3">
                              {excerpt}
                            </p>

                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3.5 sm:mb-4">
                                {tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <Link
                              href={`/blog/${post.slug}`}
                              className="inline-block bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all"
                            >
                              {isBN ? 'আরও পড়ুন' : 'Read more'}
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 sm:py-24">
                    <p className="text-gray-400 text-lg font-medium">{isBN ? 'কোনো ব্লগ পোস্ট পাওয়া যায়নি।' : 'No blog posts found.'}</p>
                    <p className="text-gray-300 text-sm mt-2">
                      {allPosts.length === 0
                        ? (isBN
                          ? 'অ্যাডমিন প্যানেল থেকে প্রকাশ করার পর এখানে ব্লগ পোস্ট দেখা যাবে।'
                          : 'Published posts will appear here once added from admin panel.')
                        : (isBN ? 'অন্য কোনো সার্চ বা ক্যাটাগরি চেষ্টা করুন।' : 'Try a different search or category.')}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="order-1 lg:order-1 lg:col-span-1 space-y-3 sm:space-y-4 lg:space-y-5 lg:sticky lg:top-24 lg:self-start">
                {/* Search Box */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm page-reveal page-delay-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isBN ? 'খুঁজুন...' : 'Search...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pl-10 rounded-xl border border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm sm:text-base"
                    />
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Categories Dropdown */}
                {categories.length > 1 && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm page-reveal page-delay-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{isBN ? 'ক্যাটাগরি' : 'Category'}</h3>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full px-3 py-2.5 sm:px-4 sm:py-3 pr-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm sm:text-base font-medium focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category === 'all' ? (isBN ? 'সব' : 'All') : getCategoryLabel(category)} ({categoryCounts[category] ?? 0})
                          </option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                {allTags.length > 0 && (
                  <div className="hidden lg:block bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm page-reveal page-delay-3">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-left"
                      onClick={() => setShowMobileTags((prev) => !prev)}
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{isBN ? 'জনপ্রিয় ট্যাগ' : 'Popular Tags'}</h3>
                      <span className="lg:hidden text-xs font-semibold text-red-600">
                        {showMobileTags ? (isBN ? 'লুকান' : 'Hide') : (isBN ? 'দেখান' : 'Show')}
                      </span>
                    </button>
                    <div className={`mt-3 sm:mt-4 flex flex-wrap gap-2 ${showMobileTags ? 'flex' : 'hidden lg:flex'}`}>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Posts */}
                {latestPosts.length > 0 && (
                  <div className="hidden lg:block bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm page-reveal page-delay-4">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-left mb-3 sm:mb-4"
                      onClick={() => setShowMobileLatest((prev) => !prev)}
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{isBN ? 'সর্বশেষ পোস্ট' : 'Latest Posts'}</h3>
                      <span className="lg:hidden text-xs font-semibold text-red-600">
                        {showMobileLatest ? (isBN ? 'লুকান' : 'Hide') : (isBN ? 'দেখান' : 'Show')}
                      </span>
                    </button>
                    <div className={`space-y-3 sm:space-y-4 ${showMobileLatest ? 'block' : 'hidden lg:block'}`}>
                      {latestPosts.map((post) => (
                        <div key={post.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                          <Link href={`/blog/${post.slug}`} className="block group">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-2 line-clamp-2">
                              {pickLocalizedText(language, post.title, post.titleBn)}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.createdAt, locale)}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </section>

    </main>
  );
}
