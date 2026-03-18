'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, iconColor, delay = 0 }) => {
  return (
    <div
      className="feature-card bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col items-start text-left h-full hover:shadow-xl transition-all duration-300 group min-h-0 sm:min-h-70 hover:border-red-100"
      style={{ animationDelay: `${Math.round(delay * 1000)}ms` }}
    >
      {/* Icon */}
      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${iconColor} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 transition-transform duration-300`}>
        <motion.div
          whileHover={{ rotateY: 180 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {icon}
        </motion.div>
      </div>
      
      {/* Title */}
      <h3 className="text-gray-900 text-lg sm:text-xl font-bold mb-2 sm:mb-4">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-500 text-sm sm:text-base leading-snug sm:leading-relaxed mb-3 sm:mb-6 grow">
        {description}
      </p>
      
      {/* Learn More Link */}
      <Link href="/service" className="text-red-500 font-semibold flex items-center gap-2 hover:text-red-600 group-hover:gap-4 transition-all mt-1 sm:mt-auto">
        Learn More
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Expert Team',
      description: 'Work with skilled professionals who bring 10+ years of industry experience to every project.',
      iconColor: 'bg-red-100',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Quality Assurance',
      description: 'Rigorous testing and quality checks ensure every project meets the highest standards.',
      iconColor: 'bg-rose-100',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'On-Time Delivery',
      description: 'We value your time. Projects are delivered on schedule without compromising quality.',
      iconColor: 'bg-red-100',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Round-the-clock technical support and assistance to keep your business running smoothly.',
      iconColor: 'bg-rose-100',
    },
  ];

  return (
    <section
      id="features"
      className="py-4 sm:py-6 md:py-10 lg:py-10 bg-white mx-auto px-4 sm:px-6 lg:px-8 page-reveal"
    >
      <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4 text-wave">
              Why Choose Motion Booster
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-wave">
              Everything you need for successful digital transformation and business growth
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {allFeatures.map((feature, index) => (
            <div 
              key={index}
              className={index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}
              style={{ animationDelay: `${Math.min(index * 80, 280)}ms` }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconColor={feature.iconColor}
                delay={Math.min(index * 0.08, 0.28)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
