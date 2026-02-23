'use client';

import React, { useState } from 'react';
import { Search, Calendar, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  image: string;
  author: string;
  date: string;
  comments: number;
  title: string;
  description: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    image: '/blog1.jpg',
    author: 'SoftService',
    date: 'April 18, 2025',
    comments: 3,
    title: 'Enhancing User Experience with Custom Web Designs',
    description: 'Discover how custom web design can set your brand apart. Find out how scalable and engaging experiences. This blog covers key principles for building layouts, optimizing speed and...',
    category: 'SEO',
  },
  {
    id: 2,
    image: '/blog2.jpg',
    author: 'SoftService',
    date: 'April 18, 2025',
    comments: 3,
    title: 'The Importance of SEO in Growing Your Online Store',
    description: 'SEO is vital for e-commerce success. Learn how to rank higher in search engines with strategic SEO to make them. This blog explores proven tips, from using the right keywords...',
    category: 'SEO',
  },
  {
    id: 3,
    image: '/blog3.jpg',
    author: 'SoftService',
    date: 'April 18, 2025',
    comments: 3,
    title: 'Effective Marketing Strategies for Small Businesses',
    description: 'Maximize your marketing impact without breaking the bank. This blog shares cost-effective strategies that small businesses can use to reach their audience, from social media campaigns...',
    category: 'Corporate HR',
  },
  {
    id: 4,
    image: '/blog4.jpg',
    author: 'SoftService',
    date: 'April 18, 2025',
    comments: 3,
    title: 'How to Streamline Your Business with Automation',
    description: 'Automation can save time and improve productivity. This blog covers the basics and best practices for streamlining business processes through automation, from email marketing to...',
    category: 'All',
  },
];

const latestPosts = [
  {
    id: 1,
    title: 'The Future of AI-Enabled MarketplaceAI.',
    date: 'May 15, 2025',
  },
  {
    id: 2,
    title: 'SEO Tips: Driving Strategies for Small Businesses',
    date: 'May 15, 2025',
  },
  {
    id: 3,
    title: 'Why Your Store of SEO Is Growing Your Online',
    date: 'May 15, 2025',
  },
  {
    id: 4,
    title: 'Enhancing User Experience with Custom Web Designs',
    date: 'May 15, 2025',
  },
];

const categories = ['All', 'SEO', 'Corporate HR'];
const popularTags = ['Business', 'Product', 'SAAS', 'Web Development', 'Marketing', 'SEO'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribe email:', email);
    // Handle subscription
  };

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Header Section */}
      <section className="py-16 px-4 bg-linear-to-br from-green-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest Insights & Updates
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed with our latest articles and updates, covering trends, tips, and insights to help you grow.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
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
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Latest Posts */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Latest Post</h3>
                <div className="space-y-4">
                  {latestPosts.map((post) => (
                    <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <Link href={`/blog/${post.id}`} className="block group">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Popular tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-red-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-400 text-sm">Blog Image</div>
                      </div>
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
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.comments} Comments
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.description}
                      </p>

                      {/* Read More Button */}
                      <Link
                        href={`/blog/${post.id}`}
                        className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all"
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* No Results */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No blog posts found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
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
