'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider, SlideData } from '@/components/ui';

export const HeroSlider = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/hero-slides')
      .then(r => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setSlides(data.map((s, i) => ({
          id: i + 1,
          image: s.customImage || s.image,
          title: '',
          description: '',
          ctaLink: s.ctaLink,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.section
        className="pt-5 pb-4 md:pt-6 md:pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-50 md:h-70 lg:h-80 rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
          </div>
        </div>
      </motion.section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <motion.section
      className="pt-5 pb-4 md:pt-6 md:pb-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
        >
          <Slider
            slides={slides}
            autoPlay={true}
            autoPlayInterval={5000}
            showControls={false}
            showIndicators={true}
            height="h-[200px] md:h-[280px] lg:h-[320px]"
          />
        </motion.div>

        <motion.div
          className="mt-4 space-y-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-bold leading-tight text-gray-900">
            Grow your business identity with Motion Booster
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">
            We provide a complete suite of digital solutions, including tailored digital marketing, eye-catching graphic design, dynamic animation, as well as expert web and app development - all designed to elevate your brand in the digital world.
          </p>
        </motion.div>

        <motion.div
          className="mt-4 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
        >
          <a
            href="/service"
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-red-700"
          >
            Browse Service
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-red-500 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};
