'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { AdminStore, PortfolioItem, defaultPortfolio } from '@/lib/admin/store';

const categories = ['All', 'Web Development', 'Graphics Design', 'Mobile App', 'Digital Marketing', 'Software Development', 'Video & Animation', 'UI/UX Design'];

export const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState<PortfolioItem[]>(defaultPortfolio);

  useEffect(() => {
    const load = () => setItems(AdminStore.getPortfolio());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const availableCategories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = activeCategory === 'All' ? items.slice(0, 6) : items.filter(i => i.category === activeCategory).slice(0, 6);

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Our Portfolio
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Explore our latest projects and success stories
          </p>
        </div>

        {/* Category Filter */}
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
              {category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Cover Image or Gradient */}
              <div className="relative h-64 overflow-hidden">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className={`w-full h-full bg-linear-to-br ${item.coverColor}`} />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Hover: live link button only */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Preview
                  </Link>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-2">
                  {item.category}
                </span>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
          >
            View All Projects
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
