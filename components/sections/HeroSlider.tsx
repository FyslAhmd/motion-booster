'use client';

import React, { useState, useEffect } from 'react';
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
      <section className="pt-2 pb-4 md:pt-3 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-50 md:h-70 lg:h-80 rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="pt-2 pb-4 md:pt-3 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Slider
          slides={slides}
          autoPlay={true}
          autoPlayInterval={5000}
          showControls={false}
          showIndicators={true}
          height="h-[200px] md:h-[280px] lg:h-[320px]"
        />
      </div>
    </section>
  );
};

