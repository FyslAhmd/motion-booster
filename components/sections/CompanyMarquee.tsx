'use client';

import React, { useState, useEffect } from 'react';
import { AdminStore, CompanyItem, defaultCompanies } from '@/lib/admin/store';

export const CompanyMarquee = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>(defaultCompanies);

  useEffect(() => {
    const load = () => setCompanies(AdminStore.getCompanies());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const list = companies.length > 0 ? companies : defaultCompanies;

  return (
    <section className="py-8 md:py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-widest">
            Trusted by Top Companies
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          {/* fade edges */}
          <div className="absolute left-0 top-0 h-full w-12 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-12 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee">
            {/* First set */}
            {list.map((company) => (
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
            {list.map((company) => (
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
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
