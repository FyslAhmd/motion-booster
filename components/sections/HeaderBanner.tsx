'use client';

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/lang/LanguageContext";
import gsap from 'gsap';

const sliderImages = [
  {
    src: "/header1.jpeg",
    alt: "IT Training Students",
    badge: "South Asia's Best IT Institute",
    year: "Awarded 2024"
  },
  {
    src: "/header2.jpeg",
    alt: "Professional Training",
    badge: "45+ Trendy Courses",
    year: "Expert Mentors"
  },
  {
    src: "/header3.jpeg",
    alt: "Career Success",
    badge: "20000+ Students Enrolled",
    year: "Join Today"
  }
];

export const HeaderBanner = () => {
  const { t, language } = useLanguage();
  const isBN = language === 'BN';
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerRef = useRef<HTMLElement | null>(null);

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.set('[data-hb-left]', { opacity: 0, x: -80 });
        gsap.set('[data-hb-right]', { opacity: 0, x: 80 });

        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.to('[data-hb-left]', { opacity: 1, x: 0, duration: 1.05 })
          .to('[data-hb-right]', { opacity: 1, x: 0, duration: 1.05 }, '-=0.72');

        return () => {
          tl.kill();
        };
      });

      return () => {
        mm.revert();
      };
    }, bannerRef);

    return () => ctx.revert();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section ref={bannerRef} className="relative w-full border-b border-gray-100 overflow-hidden">
      {/* Mobile Slider View */}
      <div className="lg:hidden pt-6 pb-5 px-4">
        <div className="relative w-full aspect-16/10 min-h-50 rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={sliderImages[currentSlide].src}
            alt={sliderImages[currentSlide].alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          
          {/* Dots Navigation */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-red-500 w-6' : 'bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href="/service"
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-red-700"
          >
            {t('header_banner_cta')}
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-red-500 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            {isBN ? 'শুরু করুন' : 'Get Started'}
          </a>
        </div>
      </div>

      {/* Desktop Grid View */}
      <div 
        className="hidden lg:block pt-28 pb-10"
        style={{ background: "url('/banner_bg.png') center / cover no-repeat" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 mt-4 lg:grid-cols-5 items-center gap-10 relative z-10">
          {/* Left: Text & Badge */}
          <div data-hb-left className="lg:col-span-2 w-full z-10 text-left flex flex-col justify-center md:items-start md:justify-center lg:min-h-90 xl:min-h-100">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold mb-3">
              ✓ Unleash Your Potential
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4">
              <span className="inline-block align-baseline">
                {t('header_banner_heading')}
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {t('header_banner_desc')}
            </p>
            <div className="flex gap-3 mb-3">
              <a
                href="/service"
                className="inline-flex items-center gap-2 px-7 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {t('header_banner_cta')}
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3 bg-white border border-red-500 text-red-600 font-semibold rounded-lg transition-all shadow hover:bg-red-50"
              >
                {isBN ? 'শুরু করুন' : 'Get Started'}
              </a>
            </div>
          </div>
          {/* Right: Image */}
          <div data-hb-right className="lg:col-span-3 relative w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/header1.jpeg"
                alt="Motion Booster IT Training"
                width={1000}
                height={680}
                className="w-full lg:h-115 object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
