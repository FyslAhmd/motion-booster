'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export interface SlideData {
  id: number;
  image: string;
  title: string;
  description: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface SliderProps {
  slides: SlideData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: string;
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  height = 'h-[500px] md:h-[600px]'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressTapRef = useRef(false);

  const swipeConfidenceThreshold = 60;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return slides.length - 1;
      if (nextIndex >= slides.length) return 0;
      return nextIndex;
    });
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, paginate]);

  return (
    <div className={`relative w-full ${height} min-h-50 overflow-hidden rounded-xl border border-gray-200 bg-gray-900`}>
      <div
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(e) => {
          pointerStartRef.current = { x: e.clientX, y: e.clientY };
          suppressTapRef.current = false;
        }}
        onPointerMove={(e) => {
          if (!pointerStartRef.current) return;
          const dx = Math.abs(e.clientX - pointerStartRef.current.x);
          const dy = Math.abs(e.clientY - pointerStartRef.current.y);
          // If pointer has moved enough, treat as swipe/drag and suppress tap navigation.
          if (dx > 6 || dy > 6) suppressTapRef.current = true;
        }}
        onPointerUp={(e) => {
          if (!pointerStartRef.current) return;
          const offsetX = e.clientX - pointerStartRef.current.x;
          const offsetY = e.clientY - pointerStartRef.current.y;
          const swipe = swipePower(offsetX, 1);

          if (Math.abs(offsetY) < Math.abs(offsetX)) {
            if (swipe < -swipeConfidenceThreshold) paginate(1);
            if (swipe > swipeConfidenceThreshold) paginate(-1);
          }

          pointerStartRef.current = null;
          window.setTimeout(() => {
            suppressTapRef.current = false;
          }, 140);
        }}
        onClick={() => {
          if (suppressTapRef.current) return;
          const link = slides[currentIndex].ctaLink;
          if (link) window.location.href = link;
        }}
        className={`absolute inset-0 ${slides[currentIndex].ctaLink ? 'cursor-pointer' : ''}`}
      >
        {/* Slide Background Image track with horizontal move animation */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(currentIndex * 100) / slides.length}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id ?? index} className="relative h-full" style={{ width: `${100 / slides.length}%` }}>
              {slide.image.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              )}
              {slide.title && (
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Slide Content */}
        <div className="absolute inset-0 hidden md:flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              {slides[currentIndex].badge && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold mb-4 page-reveal is-visible">
                  ✓ {slides[currentIndex].badge}
                </div>
              )}

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-wave is-visible">
                {slides[currentIndex].title}
              </h2>

              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed text-wave is-visible">
                {slides[currentIndex].description}
              </p>

              {slides[currentIndex].ctaText && slides[currentIndex].ctaLink && (
                <a
                  href={slides[currentIndex].ctaLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  {slides[currentIndex].ctaText}
                  <ChevronRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showControls && slides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-3 right-4 md:bottom-5 md:right-5 z-10 flex gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-red-500'
                  : 'w-2 bg-red-300 hover:bg-red-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
