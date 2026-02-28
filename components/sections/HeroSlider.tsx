'use client';

import React, { useState, useEffect } from 'react';
import { Slider, SlideData } from '@/components/ui';
import { AdminStore } from '@/lib/admin/store';

export const HeroSlider = () => {
  const [slides, setSlides] = useState<SlideData[]>([
    { id: 1, image: '/header1.jpeg', title: 'Become an IT Pro & Rule the Digital World', description: 'With a vision to turn manpower into assets, Motion Booster is ready to enhance your learning experience with skilled mentors and an updated curriculum.', badge: 'Unleash Your Potential', ctaText: 'Browse Course', ctaLink: '/features' },
    { id: 2, image: '/header2.jpeg', title: 'Learn From Industry Experts', description: "Get hands-on training from professionals with years of real-world experience. Master the skills that companies are looking for in today's competitive market.", badge: 'Expert Training', ctaText: 'Join Free Seminar', ctaLink: '/contact' },
    { id: 3, image: '/header3.jpeg', title: 'Perfect Training for Perfect IT Preparation', description: 'Comprehensive courses designed to prepare you for a successful career in IT. From beginner to advanced, we have programs tailored for every skill level.', badge: "South Asia's Best IT Institute", ctaText: 'Explore Programs', ctaLink: '/service' },
  ]);

  useEffect(() => {
    const load = () => {
      const data = AdminStore.getHeroSlides();
      setSlides(data.map((s, i) => ({
        id: i + 1,
        image: s.customImage || s.image,
        title: s.title,
        description: s.description,
        badge: s.badge,
        ctaText: s.ctaText,
        ctaLink: s.ctaLink,
      })));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

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

