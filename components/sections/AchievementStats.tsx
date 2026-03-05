'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ── helpers ─────────────────────────────────────────────── */
function parse(val: string): { num: number; suffix: string } | null {
  const m = val.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return null;
  return { num: parseFloat(m[1]), suffix: m[2] ?? '' };
}

function useCountUp(target: number, duration = 1800, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    let raf: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
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
  textColor: string;
  started: boolean;
}

function StatCard({ value, title, bgColor, textColor, started }: StatCardProps) {
  const parsed = parse(value);
  const count = useCountUp(parsed?.num ?? 0, 1800, started && parsed !== null);
  const display = parsed ? `${count}${parsed.suffix}` : value;

  return (
    <div
      className={`stat-card ${bgColor} cursor-default rounded-2xl p-4 text-center transition-all hover:shadow-lg md:p-6`}
    >
      <div className={`mb-2 text-3xl font-bold md:text-4xl ${textColor}`}>{display}</div>
      <h3 className="text-xs font-semibold leading-snug text-gray-800 md:text-sm">{title}</h3>
    </div>
  );
}

/* ── data ─────────────────────────────────────────────────── */
const stats = [
  { value: '500+', title: 'Projects Completed', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  { value: '1000+', title: 'Happy Clients', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  { value: '50+', title: 'Expert Team Members', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  { value: '100+', title: 'Business Partners', bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { value: '5+', title: 'Years of Excellence', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { value: '98%', title: 'Client Satisfaction', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
  { value: '24/7', title: 'Support Available', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { value: '15+', title: 'Countries Served', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
  { value: '300+', title: 'Active Projects', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
  { value: '10+', title: 'Industry Awards', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
];

/* ── section ──────────────────────────────────────────────── */
export const AchievementStats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-4 md:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center md:mb-12">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
            Our Achievements
          </h2>
          <p className="text-sm text-gray-600 md:text-base">
            Numbers that speak for our success and commitment to excellence
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
};
