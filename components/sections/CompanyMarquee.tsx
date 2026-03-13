'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CompanyItem {
  id: string;
  name: string;
  logoImage?: string | null;
}

export const CompanyMarquee = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);

  useEffect(() => {
    fetch('/api/v1/cms/companies')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setCompanies(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = companies;

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || list.length === 0) return;

    const interval = window.setInterval(() => {
      if (isDragging) return;
      el.scrollLeft += 0.8;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [isDragging, list.length]);

  return (
    <section className="py-8 md:py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          {loading ? (
            <div className="h-8 sm:h-10 w-64 sm:w-80 rounded-full bg-gray-200 animate-pulse mx-auto" />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
              Trusted by Top Clients
            </h2>
          )}
        </div>

        {/* Marquee Container */}
        <div
          ref={marqueeRef}
          className="relative overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onPointerDown={(e) => {
            const el = marqueeRef.current;
            if (!el) return;
            setIsDragging(true);
            setDragStartX(e.clientX);
            setDragStartScroll(el.scrollLeft);
          }}
          onPointerMove={(e) => {
            if (!isDragging) return;
            const el = marqueeRef.current;
            if (!el) return;
            const delta = e.clientX - dragStartX;
            el.scrollLeft = dragStartScroll - delta;
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          {/* fade edges */}
          <div className="absolute left-0 top-0 h-full w-12 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-12 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex w-max">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={`company-skeleton-${i}`} className="shrink-0 mx-6 md:mx-10">
                <div className="h-14 md:h-16 w-24 md:w-32 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            ))}
            {/* First set */}
            {!loading && list.map((company) => (
              <div key={`first-${company.id}`} className="shrink-0 mx-6 md:mx-10">
                <div className="flex items-center justify-center h-14 md:h-16">
                  {company.logoImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoImage}
                      alt={company.name}
                      className="h-8 md:h-10 w-auto object-contain transition-all"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold italic text-gray-900 hover:text-red-500 transition-colors whitespace-nowrap">
                      {company.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {!loading && list.map((company) => (
              <div key={`second-${company.id}`} className="shrink-0 mx-6 md:mx-10">
                <div className="flex items-center justify-center h-14 md:h-16">
                  {company.logoImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoImage}
                      alt={company.name}
                      className="h-8 md:h-10 w-auto object-contain transition-all"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold italic text-gray-900 hover:text-red-500 transition-colors whitespace-nowrap">
                      {company.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
