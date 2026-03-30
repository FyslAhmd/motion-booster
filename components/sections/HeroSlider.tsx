'use client';

import React, { useState, useEffect } from 'react';
import { Slider, SlideData } from '@/components/ui';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedText } from '@/lib/lang/localize';

type HeroSlideApiRow = {
  id?: number | string;
  image?: string;
  customImage?: string | null;
  title?: string;
  titleBn?: string | null;
  description?: string;
  descriptionBn?: string | null;
  badge?: string | null;
  badgeBn?: string | null;
  ctaText?: string | null;
  ctaTextBn?: string | null;
  ctaLink?: string | null;
};

const HERO_SLIDES_CACHE_KEY = 'heroSlides:v1';
const HERO_SLIDES_TTL_MS = 5 * 60 * 1000;

let heroSlidesMemoryCache: {
  at: number;
  rows: HeroSlideApiRow[];
} | null = null;

function mapSlides(rows: HeroSlideApiRow[], language: 'EN' | 'BN'): SlideData[] {
  return rows.map((s, i) => ({
    id: Number.isFinite(Number(s.id)) ? Number(s.id) : i + 1,
    image: s.customImage || s.image || '/header1.jpeg',
    title: pickLocalizedText(language, s.title, s.titleBn),
    description: pickLocalizedText(language, s.description, s.descriptionBn),
    badge: pickLocalizedText(language, s.badge, s.badgeBn),
    ctaText: pickLocalizedText(language, s.ctaText, s.ctaTextBn),
    ctaLink: s.ctaLink || undefined,
  }));
}

export const HeroSlider = () => {
  const { language } = useLanguage();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();

    const hydrateFromCache = () => {
      if (heroSlidesMemoryCache && now - heroSlidesMemoryCache.at < HERO_SLIDES_TTL_MS) {
        setSlides(mapSlides(heroSlidesMemoryCache.rows, language));
        setLoading(false);
        return true;
      }

      try {
        const raw = sessionStorage.getItem(HERO_SLIDES_CACHE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as { at: number; rows: HeroSlideApiRow[] };
        if (!Array.isArray(parsed?.rows) || now - parsed.at >= HERO_SLIDES_TTL_MS) {
          return false;
        }

        heroSlidesMemoryCache = parsed;
        setSlides(mapSlides(parsed.rows, language));
        setLoading(false);
        return true;
      } catch {
        return false;
      }
    };

    const hasWarmCache = hydrateFromCache();
    if (!hasWarmCache) setLoading(true);

    fetch('/api/v1/cms/hero-slides')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const payload = { at: Date.now(), rows: data as HeroSlideApiRow[] };
        heroSlidesMemoryCache = payload;
        try {
          sessionStorage.setItem(HERO_SLIDES_CACHE_KEY, JSON.stringify(payload));
        } catch {
          // Ignore storage quota/unavailable errors.
        }
        setSlides(mapSlides(payload.rows, language));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  if (loading) {
    return (
      <section className="pt-5 pb-4 md:pt-6 md:pb-6 page-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-50 md:h-70 lg:h-80 rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-4 flex items-center gap-3">
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
