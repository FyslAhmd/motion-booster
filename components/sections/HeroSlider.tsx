'use client';

import React from 'react';
import { Slider, SlideData } from '@/components/ui';

export const HeroSlider = () => {
  const slides: SlideData[] = [
    {
      id: 1,
      image: '/hero_img_4.jpg',
      title: 'Become an IT Pro & Rule the Digital World',
      description: 'With a vision to turn manpower into assets, Motion Booster is ready to enhance your learning experience with skilled mentors and an updated curriculum. Pick your desired course from more than 45 trendy options.',
      badge: 'Unleash Your Potential',
      ctaText: 'Browse Course',
      ctaLink: '/features'
    },
    {
      id: 2,
      image: '/feature_8.jpg',
      title: 'Learn From Industry Experts',
      description: 'Get hands-on training from professionals with years of real-world experience. Master the skills that companies are looking for in today\'s competitive market.',
      badge: 'Expert Training',
      ctaText: 'Join Free Seminar',
      ctaLink: '/contact'
    },
    {
      id: 3,
      image: '/Illustration_5.png',
      title: 'Perfect Training for Perfect IT Preparation',
      description: 'Comprehensive courses designed to prepare you for a successful career in IT. From beginner to advanced, we have programs tailored for every skill level.',
      badge: 'South Asia\'s Best IT Institute',
      ctaText: 'Explore Programs',
      ctaLink: '/service'
    }
  ];

  return (
    <section className="pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Slider 
          slides={slides}
          autoPlay={true}
          autoPlayInterval={5000}
          showControls={true}
          showIndicators={true}
          height="h-[400px] md:h-[500px] lg:h-[600px]"
        />
      </div>
    </section>
  );
};
