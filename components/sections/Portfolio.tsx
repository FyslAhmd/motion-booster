'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  link: string;
  description: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: 'E-commerce Platform',
    category: 'Web Development',
    image: '/portfolio-1.jpg',
    link: '#',
    description: 'Modern e-commerce solution with payment integration'
  },
  {
    id: 2,
    title: 'Brand Identity Design',
    category: 'Graphics Design',
    image: '/portfolio-2.jpg',
    link: '#',
    description: 'Complete brand identity for tech startup'
  },
  {
    id: 3,
    title: 'Mobile Banking App',
    category: 'Mobile App',
    image: '/portfolio-3.jpg',
    link: '#',
    description: 'Secure banking application for iOS and Android'
  },
  {
    id: 4,
    title: 'Social Media Campaign',
    category: 'Digital Marketing',
    image: '/portfolio-4.jpg',
    link: '#',
    description: 'Viral marketing campaign reaching 2M+ users'
  },
  {
    id: 5,
    title: 'Corporate Website',
    category: 'Web Development',
    image: '/portfolio-5.jpg',
    link: '#',
    description: 'Professional corporate website with CMS'
  },
  {
    id: 6,
    title: 'Product Photography',
    category: 'Graphics Design',
    image: '/portfolio-6.jpg',
    link: '#',
    description: 'High-quality product photography and editing'
  },
];

const categories = ['All', 'Web Development', 'Graphics Design', 'Mobile App', 'Digital Marketing'];

export const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory);

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
          {categories.map((category) => (
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
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full">
                    <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/90 text-sm mb-3">
                      {item.description}
                    </p>
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all"
                    >
                      View Project
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card Info (visible by default) */}
              <div className="p-4 group-hover:opacity-0 transition-opacity duration-300">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-2">
                  {item.category}
                </span>
                <h3 className="font-bold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
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
