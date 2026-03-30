'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

export interface SlideData {
  id: number | string;
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
  autoPlayInterval = 4000,
  showControls = true,
  showIndicators = true,
  height = 'h-[500px] md:h-[600px]',
}) => {
  const autoplay = useRef(
    Autoplay({
      delay: autoPlayInterval,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: slides.length > 1,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
    },
    autoPlay ? [autoplay.current] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  if (!slides.length) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-xl ${height}`}>
      {/* VIEWPORT */}
      <div className="h-full overflow-hidden" ref={emblaRef}>
        {/* CONTAINER */}
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative h-full min-h-full min-w-full flex-[0_0_100%]"
            >
              {(() => {
                const src = slide.image || '';
                const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');
                const isLocalPath = src.startsWith('/');

                // Use native img for external/data/blob sources so CMS URLs are never blocked by next/image host restrictions.
                if (isDataOrBlob || !isLocalPath) {
                  return (
                    <img
                      src={src}
                      alt={slide.title || ''}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  );
                }

                return (
                  <Image
                    src={src}
                    alt={slide.title || ''}
                    fill
                    sizes="100vw"
                    className="object-cover select-none pointer-events-none"
                    priority={index === 0}
                  />
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION */}
      {showControls && slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur p-3 rounded-full text-white"
          >
            ‹
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur p-3 rounded-full text-white"
          >
            ›
          </button>
        </>
      )}

      {/* DOTS */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? 'w-6 bg-red-500'
                  : 'w-2 bg-red-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
