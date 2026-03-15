'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface CompanyItem {
  id: string;
  name: string;
  logoImage?: string | null;
}

export const CompanyMarquee = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  useEffect(() => {
    fetch('/api/v1/cms/companies')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setCompanies(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = companies;
  const REPEAT_SETS = 3;

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || list.length === 0 || prefersReducedMotion) return;

    let rafId = 0;
    let lastTs = 0;

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!isDraggingRef.current) {
        // Slightly faster on desktop so movement is visible without being distracting.
        const speedPxPerSecond = window.innerWidth < 768 ? 40 : 56;
        const singleSetWidth = el.scrollWidth / REPEAT_SETS;
        el.scrollLeft += (speedPxPerSecond * dt) / 1000;

        if (singleSetWidth > 0 && el.scrollLeft >= singleSetWidth) {
          el.scrollLeft -= singleSetWidth;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [list.length, prefersReducedMotion]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = marqueeRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = el.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = marqueeRef.current;
    if (!el) return;
    const delta = e.clientX - dragStartXRef.current;
    el.scrollLeft = dragStartScrollRef.current - delta;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <motion.section
      className="py-8 md:py-10 lg:py-8 bg-white border-y border-gray-100"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.h2
            className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            Trusted by Top Clients
          </motion.h2>
        </div>

        {/* Marquee Container */}
        <motion.div
          ref={marqueeRef}
          className={`relative overflow-x-auto overflow-y-hidden no-scrollbar select-none touch-pan-x ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={(e) => {
            if (!isDraggingRef.current) return;
            endDrag(e);
          }}
        >
          {/* fade edges */}
          <div className="absolute left-0 top-0 h-full w-12 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-12 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex w-max">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={`company-skeleton-${i}`} className="shrink-0 mx-5 md:mx-8">
                <div className="h-14 md:h-16 w-28 md:w-40 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            ))}
            {!loading && Array.from({ length: REPEAT_SETS }).map((_, setIndex) => (
              <React.Fragment key={`set-${setIndex}`}>
                {list.map((company, index) => (
                  <motion.div
                    key={`set-${setIndex}-${company.id}`}
                    className="company-logo-item shrink-0 mx-5 md:mx-8"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.35,
                      delay: setIndex === 0 ? Math.min(index * 0.05, 0.28) : 0,
                      ease: 'easeOut',
                    }}
                  >
                    <div className="flex items-center justify-center h-14 md:h-16">
                      {company.logoImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoImage}
                          alt={company.name}
                          className="h-8 md:h-10 w-14 md:w-20 lg:w-24 object-cover rounded-sm transition-all"
                        />
                      ) : (
                        <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold italic text-gray-900 hover:text-red-500 transition-colors whitespace-nowrap">
                          {company.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
