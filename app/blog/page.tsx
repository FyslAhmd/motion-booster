'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/v1/cms/blog')
      .then(r => r.json())
      .then(data => {
        const published = (Array.isArray(data) ? data : []).filter(
          (p: BlogPost) => p.status === 'PUBLISHED'
        );
        setAllPosts(published);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(allPosts.map(p => p.category).filter(Boolean)))];
  const allTags = Array.from(new Set(allPosts.flatMap(p => p.tags)));
  const latestPosts = [...allPosts].slice(0, 4);

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <main className="min-h-screen bg-white pb-16 lg:pb-0">
      {/* Header Section */}
      <section className="py-20 lg:py-32 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Latest Insights &
            <span className="block text-red-600">
              Updates
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed with our latest articles and updates, covering trends, tips, and insights to help you grow.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                {/* Search Box */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 1 && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategory === category}
                            onChange={() => setSelectedCategory(category)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Posts */}
                {latestPosts.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Latest Post</h3>
                    <div className="space-y-4">
                      {latestPosts.map((post) => (
                        <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                          <Link href={`/blog/${post.slug}`} className="block group">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-2">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.createdAt)}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                {allTags.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Popular tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Blog Posts Grid */}
              <div className="lg:col-span-3">
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredPosts.map((post) => (
                      <article
                        key={post.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Cover Image */}
                        <div className="relative h-48 bg-red-50">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-gray-300 text-sm">No Image</div>
                            </div>
                          )}
                          {post.category && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                              {post.category}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              By {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Read More */}
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all"
                          >
                            Read More
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <p className="text-gray-400 text-lg font-medium">No blog posts found.</p>
                    <p className="text-gray-300 text-sm mt-2">
                      {allPosts.length === 0
                        ? 'Blog posts will appear here once published from the admin panel.'
                        : 'Try a different search or category.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-red-600 overflow-hidden">
        {/* Red Circle Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-red-700 rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to enhance your sales &<br />customer satisfaction?
          </h2>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-full border-2 border-white/30 bg-white/10 text-white placeholder-white/70 focus:border-white focus:bg-white/20 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-red-600 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </form>
          <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
            No credit card required • Cancel anytime
          </p>
          <p className="text-white text-xs sm:text-sm opacity-70">
            Questions? Contact us at{' '}
            <a href="mailto:hello@youragency.com" className="underline hover:opacity-100">
              hello@youragency.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
