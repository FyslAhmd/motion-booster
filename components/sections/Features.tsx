'use client';

import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, iconColor }) => {
  return (
    <div className="bg-gray-900 rounded-3xl p-8 flex flex-col items-center text-center h-full">
      {/* Icon */}
      <div className={`w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center mb-6`}>
        <div className="hover:flip-horizontal">
          {icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-white text-xl font-bold mb-4">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        {description}
      </p>
      
      {/* Learn More Link */}
      <Link href="#" className="text-white font-medium flex items-center gap-2 hover:text-green-400 transition-colors">
        Learn More
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
};

export const Features = () => {
  const allFeatures = [
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Contact Management',
      description: 'Store and organize customer information in a centralized, easily accessible database.',
      iconColor: 'bg-green-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Sales Track Management',
      description: 'Track and manage sales leads from initial contact to deal closure.',
      iconColor: 'bg-cyan-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Reporting and Analytics',
      description: 'Generate detailed reports and insights into sales, customer behavior, and business health.',
      iconColor: 'bg-green-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Contact Management',
      description: 'Store and organize customer information in a centralized, easily accessible database.',
      iconColor: 'bg-green-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Contact Management',
      description: 'Store and organize customer information in a centralized, easily accessible database.',
      iconColor: 'bg-green-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Sales Track Management',
      description: 'Track and manage sales leads from initial contact to deal closure.',
      iconColor: 'bg-cyan-400',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-linear-to-b from-purple-50 to-white max-w-7xl mx-auto mt-10 px-6 lg:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Core Features of Our CRM Application
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-gray-600 leading-relaxed">
              Discover the essential tools and functionalities designed to optimize your customer management, improve sales efficiency, and enhance overall business performance.
            </p>
          </div>
        </div>

        {/* Marquee Feature Cards - Always shows 3 cards */}
        <div className="relative overflow-hidden mb-12">
          <div className="flex animate-marquee-continuous">
            {/* First set */}
            {allFeatures.map((feature, index) => (
              <div key={`first-${index}`} className="shrink-0 w-full md:w-1/2 lg:w-1/3 px-3">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  iconColor={feature.iconColor}
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {allFeatures.map((feature, index) => (
              <div key={`second-${index}`} className="shrink-0 w-full md:w-1/2 lg:w-1/3 px-3">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  iconColor={feature.iconColor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

