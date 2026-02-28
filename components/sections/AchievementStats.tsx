'use client';

import React from 'react';

const stats = [
  {
    value: '500+',
    title: 'Projects Completed',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    value: '1000+',
    title: 'Happy Clients',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    value: '50+',
    title: 'Expert Team Members',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
  },
  {
    value: '100+',
    title: 'Business Partners',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    value: '5+',
    title: 'Years of Excellence',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    value: '98%',
    title: 'Client Satisfaction',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    value: '24/7',
    title: 'Support Available',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    value: '15+',
    title: 'Countries Served',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  {
    value: '300+',
    title: 'Active Projects',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    value: '10+',
    title: 'Industry Awards',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
  },
];

export const AchievementStats = () => {
  return (
    <section className="py-4 md:py-6 lg:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Our Achievements
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Numbers that speak for our success and commitment to excellence
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`stat-card ${stat.bgColor} rounded-2xl p-4 md:p-6 text-center transition-all hover:shadow-lg cursor-default`}
            >
              <div className={`text-3xl md:text-4xl font-bold ${stat.textColor} mb-2`}>
                {stat.value}
              </div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-800 leading-snug">
                {stat.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
