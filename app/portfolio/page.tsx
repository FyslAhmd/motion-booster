'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminStore, PortfolioItem, defaultPortfolio } from '@/lib/admin/store';
import { Tag, User, TrendingUp } from 'lucide-react';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>(defaultPortfolio);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    const load = () => setItems(AdminStore.getPortfolio());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <main className="min-h-screen bg-gray-50">
        {/* Hero banner */}
        <div className="bg-linear-to-br from-red-50 via-white to-rose-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Our Projects</h1>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl">
              Explore our complete portfolio of work — from web development and mobile apps to digital marketing and brand design.
            </p>
            <p className="mt-3 text-sm text-gray-400">{items.length} projects across {categories.length - 1} categories</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-red-500 text-white shadow-md shadow-red-200'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-red-200' : 'text-gray-400'}`}>
                    ({items.filter(i => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Cover */}
                <div className="relative h-48 overflow-hidden">
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${item.coverColor}`} />
                  )}
                  {item.featured && (
                    <span className="absolute top-3 left-3 bg-white/90 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {item.category}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{item.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No projects in this category yet.</p>
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
                <img src={selected.coverImage} alt={selected.title} className="w-full h-full object-cover" />
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
                {selected.category}
              </span>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 leading-snug">{selected.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{selected.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                  <User className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Client</p>
                    <p className="text-sm font-medium text-gray-800">{selected.client}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-green-50 rounded-xl p-3">
                  <TrendingUp className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Result</p>
                    <p className="text-sm font-medium text-gray-800">{selected.result}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Technologies</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(tag => (
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
                  Start Similar Project
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
