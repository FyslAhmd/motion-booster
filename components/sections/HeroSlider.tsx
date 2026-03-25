'use client';

import React, { useState, useEffect } from 'react';
import { Slider, SlideData } from '@/components/ui';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedText } from '@/lib/lang/localize';

export const HeroSlider = () => {
  const { language } = useLanguage();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/cms/hero-slides', { cache: 'no-store' })
      .then(r => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setSlides(data.map((s, i) => ({
          id: i + 1,
          image: s.customImage || s.image,
          title: pickLocalizedText(language, s.title, s.titleBn),
          description: pickLocalizedText(language, s.description, s.descriptionBn),
          badge: pickLocalizedText(language, s.badge, s.badgeBn),
          ctaText: pickLocalizedText(language, s.ctaText, s.ctaTextBn),
          ctaLink: s.ctaLink,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) {
    return (
      <section className="pt-5 pb-4 md:pt-6 md:pb-6 page-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-50 md:h-70 lg:h-80 rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="pt-5 pb-4 md:pt-6 md:pb-6 page-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-reveal-left">
          <Slider
            slides={slides}
            autoPlay={true}
            autoPlayInterval={5000}
            showControls={false}
            showIndicators={true}
            height="h-[200px] md:h-[280px] lg:h-[320px]"
          />
        </div>
      </div>
    </section>
  );
};
