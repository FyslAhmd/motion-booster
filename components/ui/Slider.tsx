'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  if (slides.length === 0) return null;

  const canLoop = slides.length > 1;
  const useNavigation = showControls && canLoop;
  const usePagination = showIndicators && canLoop;

  return (
    <div className={`relative w-full ${height} min-h-50 overflow-hidden rounded-xl border border-gray-200 bg-black`}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        className="motion-swiper h-full w-full"
        slidesPerView={1}
        spaceBetween={0}
        loop={canLoop}
        speed={1400}
        watchSlidesProgress={true}
        navigation={useNavigation}
        pagination={usePagination ? { clickable: true } : false}
        autoplay={
          autoPlay && canLoop
            ? {
                delay: autoPlayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: true,
              }
            : false
        }
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.id ?? 'slide'}-${index}`}>
            <div
              className={`relative h-full w-full ${slide.ctaLink ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (slide.ctaLink) window.location.href = slide.ctaLink;
              }}
            >
              {slide.image.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.image} alt={slide.title || `Slide ${index + 1}`} className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.title || `Slide ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              )}

              {(slide.title || slide.description || slide.badge || (slide.ctaText && slide.ctaLink)) && (
                <div className="absolute inset-0 hidden items-center bg-linear-to-r from-black/70 via-black/45 to-transparent md:flex">
                  <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                    <div className="max-w-2xl">
                      {slide.badge && (
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                          {'\u2713'} {slide.badge}
                        </div>
                      )}

                      {slide.title && (
                        <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                          {slide.title}
                        </h2>
                      )}

                      {slide.description && (
                        <p className="mb-8 text-lg leading-relaxed text-gray-200 md:text-xl">
                          {slide.description}
                        </p>
                      )}

                      {slide.ctaText && slide.ctaLink && (
                        <a
                          href={slide.ctaLink}
                          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-red-500 to-red-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                        >
                          {slide.ctaText}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .motion-swiper {
          overflow: hidden;
        }

        .motion-swiper .swiper-slide {
          transition: transform 700ms ease, opacity 700ms ease;
          transform: scale(1);
          opacity: 1;
        }

        .motion-swiper .swiper-slide-active {
          transform: scale(1);
          opacity: 1;
        }

        .motion-swiper .swiper-slide-next,
        .motion-swiper .swiper-slide-prev {
          opacity: 1;
          transform: scale(1);
        }

        .motion-swiper .swiper-wrapper {
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }

        .motion-swiper .swiper-button-next,
        .motion-swiper .swiper-button-prev {
          color: #ffffff;
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(6px);
        }

        .motion-swiper .swiper-button-next:after,
        .motion-swiper .swiper-button-prev:after {
          font-size: 16px;
          font-weight: 700;
        }

        .motion-swiper .swiper-pagination {
          left: auto !important;
          right: 12px !important;
          bottom: 10px !important;
          width: auto !important;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .motion-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          margin: 0 !important;
          border-radius: 9999px;
          background: #fca5a5;
          opacity: 1;
          transition: all 220ms ease;
        }

        .motion-swiper .swiper-pagination-bullet-active {
          width: 24px;
          background: #ef4444;
        }

        @media (max-width: 767px) {
          .motion-swiper .swiper-button-next,
          .motion-swiper .swiper-button-prev {
            width: 34px;
            height: 34px;
          }

          .motion-swiper .swiper-button-next:after,
          .motion-swiper .swiper-button-prev:after {
            font-size: 13px;
          }

          .motion-swiper .swiper-pagination {
            right: 10px !important;
            bottom: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};
