'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { TrendingUp, Palette, Code, Globe, Smartphone, Layers, Sparkles, Video, Briefcase, Zap } from 'lucide-react';

const categories = [
  {
    icon: <TrendingUp className="w-7 h-7 text-green-600" />,
    title: 'Digital Marketing',
    href: '/category/digital-marketing',
    iconBg: 'bg-green-50',
  },
  {
    icon: <Palette className="w-7 h-7 text-purple-600" />,
    title: 'Graphics Design',
    href: '/category/graphics-design',
    iconBg: 'bg-purple-50',
  },
  {
    icon: <Code className="w-7 h-7 text-blue-600" />,
    title: 'Software Development',
    href: '/category/software-development',
    iconBg: 'bg-blue-50',
  },
  {
    icon: <Globe className="w-7 h-7 text-cyan-600" />,
    title: 'Web Development',
    href: '/category/web-development',
    iconBg: 'bg-cyan-50',
  },
  {
    icon: <Smartphone className="w-7 h-7 text-pink-600" />,
    title: 'Mobile App Development',
    href: '/category/mobile-app-development',
    iconBg: 'bg-pink-50',
  },
  {
    icon: <Layers className="w-7 h-7 text-orange-500" />,
    title: 'UI/UX Design',
    href: '/category/ui-ux-design',
    iconBg: 'bg-orange-50',
  },
  {
    icon: <Sparkles className="w-7 h-7 text-yellow-600" />,
    title: 'Branding & Creative',
    href: '/category/branding-creative',
    iconBg: 'bg-yellow-50',
  },
  {
    icon: <Video className="w-7 h-7 text-red-500" />,
    title: 'Video & Animation',
    href: '/category/video-animation',
    iconBg: 'bg-red-50',
  },
  {
    icon: <Briefcase className="w-7 h-7 text-indigo-600" />,
    title: 'Business Consulting',
    href: '/category/business-consulting',
    iconBg: 'bg-indigo-50',
  },
  {
    icon: <Zap className="w-7 h-7 text-teal-600" />,
    title: 'Specialized Services',
    href: '/category/specialized-services',
    iconBg: 'bg-teal-50',
  },
];

export const CategorySlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative z-20 py-8 sm:py-10 lg:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Our Categories
        </h2>
        
        <div className="relative flex items-center">


          {/* Categories */}
          <div
            ref={scrollRef}
            className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="category-card group shrink-0 flex flex-col items-center justify-center w-28 h-24 sm:w-36 sm:h-30 md:w-40 md:h-32.5 bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 px-2 sm:px-4"
              >
                <div className="mb-1.5 sm:mb-3">
                  {React.cloneElement(category.icon as React.ReactElement, {
                    className: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ' + (category.icon as React.ReactElement).props.className.split(' ').slice(2).join(' ')
                  })}
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-red-500 text-center leading-tight transition-colors">
                  {category.title}
                </span>
              </Link>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
};
