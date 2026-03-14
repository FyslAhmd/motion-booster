'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

interface StatItem {
  id: string;
  value: string;
  title: string;
  description: string;
  bgColor: string;
  valueColor: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarBg: string;
  avatarImage?: string | null;
  rating: number;
  review: string;
  service: string;
}

export const Testimonials = () => {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [draggingTarget, setDraggingTarget] = useState<'stats' | 'reviews' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);

  useEffect(() => {
    fetch('/api/v1/cms/testimonials')
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingReviews(false));

    fetch('/api/v1/cms/stats')
      .then(r => r.json())
      .then(data => setStats(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    const statsEl = statsRef.current;
    const reviewsEl = reviewsRef.current;
    if (!statsEl || !reviewsEl) return;

    const interval = window.setInterval(() => {
      if (draggingTarget === 'stats') return;
      statsEl.scrollLeft += 0.7;
      if (statsEl.scrollLeft >= statsEl.scrollWidth / 2) statsEl.scrollLeft = 0;
    }, 16);

    const interval2 = window.setInterval(() => {
      if (draggingTarget === 'reviews') return;
      reviewsEl.scrollLeft += 0.8;
      if (reviewsEl.scrollLeft >= reviewsEl.scrollWidth / 2) reviewsEl.scrollLeft = 0;
    }, 16);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(interval2);
    };
  }, [draggingTarget]);

  const ReviewCard = ({ review }: { review: TestimonialItem }) => (
    <div className="testimonial-review-card shrink-0 w-80 sm:w-90 md:w-100 bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow cursor-default">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar on left */}
        {review.avatarImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.avatarImage} alt={review.name} className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-md" />
        ) : (
          <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br ${review.avatarBg} flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md`}>
            {review.avatar || review.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{review.name}</h4>
          <p className="text-gray-500 text-xs mb-1">{review.role}</p>

          <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-2">
            {review.service}
          </span>

          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-400 text-orange-400" />
            ))}
          </div>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {review.review}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-16 lg:py-14 bg-white overflow-hidden">
      <style>{`
        .drag-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .drag-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section — auto-scroll left → right */}
        <div
          ref={statsRef}
          className="mb-12 sm:mb-16 md:mb-20 overflow-x-auto overflow-y-hidden drag-scroll cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => {
            const el = statsRef.current;
            if (!el) return;
            setDraggingTarget('stats');
            setDragStartX(e.clientX);
            setDragStartScroll(el.scrollLeft);
          }}
          onPointerMove={(e) => {
            if (draggingTarget !== 'stats') return;
            const el = statsRef.current;
            if (!el) return;
            const delta = e.clientX - dragStartX;
            el.scrollLeft = dragStartScroll - delta;
          }}
          onPointerUp={() => setDraggingTarget(null)}
          onPointerLeave={() => setDraggingTarget(null)}
        >
          <div className="flex w-max gap-3 sm:gap-4 md:gap-6">
            {loadingStats && Array.from({ length: 5 }).map((_, i) => (
              <div key={`stats-skeleton-${i}`} className="shrink-0 w-64 sm:w-72 md:w-75 lg:w-85 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 bg-gray-100">
                <div className="h-9 sm:h-10 md:h-12 w-2/3 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3" />
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3 md:mb-4" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
            {!loadingStats && [...stats, ...stats].map((stat, index) => (
              <div
                key={index}
                className={`shrink-0 w-64 sm:w-72 md:w-75 lg:w-85 ${stat.bgColor} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 transition-all hover:shadow-lg`}
              >
                <div className={`text-3xl sm:text-4xl md:text-5xl font-bold ${stat.valueColor} mb-2 sm:mb-3`}>
                  {stat.value}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{stat.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Client Reviews Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4">
            Real feedback from our valued clients who trusted Motion Booster with their digital journey.
          </p>
        </div>
      </div>

      {/* Row 1 — left → right (single row only) */}
      <div
        ref={reviewsRef}
        className="max-w-7xl mx-auto overflow-x-auto overflow-y-hidden drag-scroll cursor-grab active:cursor-grabbing select-none"
        onPointerDown={(e) => {
          const el = reviewsRef.current;
          if (!el) return;
          setDraggingTarget('reviews');
          setDragStartX(e.clientX);
          setDragStartScroll(el.scrollLeft);
        }}
        onPointerMove={(e) => {
          if (draggingTarget !== 'reviews') return;
          const el = reviewsRef.current;
          if (!el) return;
          const delta = e.clientX - dragStartX;
          el.scrollLeft = dragStartScroll - delta;
        }}
        onPointerUp={() => setDraggingTarget(null)}
        onPointerLeave={() => setDraggingTarget(null)}
      >
        <div className="flex w-max gap-3 sm:gap-4 md:gap-6 pb-4">
          {loadingReviews && Array.from({ length: 4 }).map((_, i) => (
            <div key={`review-skeleton-${i}`} className="shrink-0 w-80 sm:w-90 md:w-100 bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
          {!loadingReviews && [...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`r1-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};
