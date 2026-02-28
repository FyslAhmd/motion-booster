'use client';

import React from 'react';

const companies = [
  { id: 1, name: 'Google' },
  { id: 2, name: 'Microsoft' },
  { id: 3, name: 'Amazon' },
  { id: 4, name: 'Facebook' },
  { id: 5, name: 'Apple' },
  { id: 6, name: 'Netflix' },
];

export const CompanyMarquee = () => {
  return (
    <section className="py-8 md:py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Trusted by Leading Companies
          </h3>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee">
            {/* First set of companies */}
            {companies.map((company) => (
              <div
                key={`first-${company.id}`}
                className="flex-shrink-0 mx-8 md:mx-12"
              >
                <div className="flex items-center justify-center h-16 md:h-20">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold italic text-gray-700 hover:text-red-500 transition-colors">
                    {company.name}
                  </span>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {companies.map((company) => (
              <div
                key={`second-${company.id}`}
                className="flex-shrink-0 mx-8 md:mx-12"
              >
                <div className="flex items-center justify-center h-16 md:h-20">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold italic text-gray-700 hover:text-red-500 transition-colors">
                    {company.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
