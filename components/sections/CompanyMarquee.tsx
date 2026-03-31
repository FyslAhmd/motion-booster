'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/lang/LanguageContext';

interface CompanyItem {
  id: string;
  name: string;
  logoImage?: string | null;
}

type RawCompanyItem = {
  id?: string;
  name?: string;
  logoImage?: string | null;
  logo_image?: string | null;
};

export const CompanyMarquee = () => {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const offsetRef = useRef(0);
  const setWidthRef = useRef(0);

  const normalizeCompanies = (data: unknown): CompanyItem[] => {
    if (!Array.isArray(data)) return [];
    return data
      .map((row: RawCompanyItem) => ({
        id: String(row?.id || ''),
        name: String(row?.name || '').trim(),
        logoImage: (row?.logoImage || row?.logo_image || null) as string | null,
      }))
      .filter((row) => row.id && row.name);
  };

  const loadCompanies = () => {
    fetch('/api/v1/cms/companies', { cache: 'no-store' })
      .then(r => r.json())
      .then((data) => setCompanies(normalizeCompanies(data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'companies:lastUpdated') {
        setLoading(true);
        loadCompanies();
      }
    };

    const onWindowFocus = () => {
      setLoading(true);
      loadCompanies();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onWindowFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);

  const list = companies;
  const REPEAT_SETS = 3;

  const normalizeOffset = (value: number) => {
    const width = setWidthRef.current;
    if (width <= 0) return 0;
    return ((value % width) + width) % width;
  };

  const applyTransform = () => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    trackEl.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  };

  useEffect(() => {
    const el = marqueeRef.current;
    const trackEl = trackRef.current;
    const firstSetEl = firstSetRef.current;
    if (!el || !trackEl || !firstSetEl || list.length === 0) return;

    let rafId = 0;
    let lastTs = 0;
    const singleSetWidth = firstSetEl.offsetWidth;
    if (singleSetWidth <= 0) return;
    setWidthRef.current = singleSetWidth;

    // Keep offset valid when dimensions/data change.
    offsetRef.current = normalizeOffset(offsetRef.current);
    applyTransform();

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!isDraggingRef.current) {
        // Slightly faster on desktop so movement is visible without being distracting.
        const speedPxPerSecond = window.innerWidth < 768 ? 40 : 56;
        offsetRef.current = normalizeOffset(offsetRef.current + (speedPxPerSecond * dt) / 1000);
        applyTransform();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [list.length]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (setWidthRef.current <= 0 || !e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !e.isPrimary) return;
    e.preventDefault();
    const delta = e.clientX - dragStartXRef.current;
    offsetRef.current = normalizeOffset(dragStartOffsetRef.current - delta);
    applyTransform();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <section className="py-8 md:py-10 lg:py-8 bg-white border-y border-gray-100 page-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl text-wave">
            {t('companies_heading')}
          </h2>
        </div>

        {/* Marquee Container */}
        <div
          ref={marqueeRef}
          className={`relative overflow-hidden select-none touch-pan-y ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          data-marquee="company"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onDragStart={(e) => e.preventDefault()}
        >
          <div ref={trackRef} className="flex w-max items-center will-change-transform">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={`company-skeleton-${i}`} className="shrink-0 pr-10 md:pr-16">
                <div className="h-14 md:h-16 w-28 md:w-40 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            ))}
            {!loading && Array.from({ length: REPEAT_SETS }).map((_, setIndex) => (
              <div
                key={`set-${setIndex}`}
                ref={setIndex === 0 ? firstSetRef : undefined}
                className="flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16"
              >
                {list.map((company, index) => (
                  <div
                    key={`set-${setIndex}-${company.id}`}
                    className={`company-logo-item shrink-0 ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
                    style={{ animationDelay: `${setIndex === 0 ? Math.min(index * 50, 280) : 0}ms` }}
                  >
                    <div className="flex h-14 md:h-16 items-center justify-center">
                      {company.logoImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoImage}
                          alt={company.name}
                          draggable={false}
                          className="block h-10 md:h-10 lg:h-10 w-auto max-w-none object-contain rounded-sm"
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
