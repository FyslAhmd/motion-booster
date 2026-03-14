'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ── helpers ─────────────────────────────────────────────── */
function parse(val: string): { num: number; suffix: string } | null {
  const m = val.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return null;
  return { num: parseFloat(m[1]), suffix: m[2] ?? '' };
}

function useCountUp(target: number, duration = 2500, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    let raf: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);

  return count;
}

/* ── StatCard ─────────────────────────────────────────────── */
interface StatCardProps {
  value: string;
  title: string;
  bgColor: string;
  valueColor: string;
  started: boolean;
}

function StatCard({ value, title, bgColor, valueColor, started }: StatCardProps) {
  const parsed = parse(value);
  const count = useCountUp(parsed?.num ?? 0, 1800, started && parsed !== null);
  const display = parsed ? `${count}${parsed.suffix}` : value;

  return (
    <div
      className={`stat-card achievement-stat-card ${bgColor} cursor-default rounded-2xl p-5 sm:p-6 text-center transition-all hover:shadow-lg`}
    >
      <div className={`mb-2 text-4xl sm:text-5xl font-extrabold tracking-tight ${valueColor}`}>{display}</div>
      <h3 className="text-xs sm:text-sm font-bold leading-snug text-gray-800">{title}</h3>
    </div>
  );
}

/* ── types ────────────────────────────────────────────────── */
interface StatItem {
  id: string;
  value: string;
  title: string;
  bgColor: string;
  valueColor: string;
}

/* ── section ──────────────────────────────────────────────── */
export const AchievementStats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/stats')
      .then(r => r.json())
      .then(data => {
        setStats(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -80px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <section ref={sectionRef} className="bg-white py-8 md:py-12 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center md:mb-14">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
            Our Achievements
          </h2>
          <p className="text-sm text-gray-600 md:text-base">
            Numbers that speak for our success and commitment to excellence
          </p>
        </div>

        {/* Grid */}
        {!loaded ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 p-5 sm:p-6">
                <div className="mb-2 mx-auto h-10 sm:h-12 w-20 sm:w-24 rounded-lg bg-gray-200" />
                <div className="mx-auto h-3 w-24 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <StatCard key={stat.id} {...stat} started={started} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
