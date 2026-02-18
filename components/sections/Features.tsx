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
    <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-start text-left h-full hover:shadow-2xl transition-all duration-300 group min-h-[280px] sm:min-h-70">
      {/* Icon */}
      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${iconColor} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-transform duration-300`}>
        <div className="group-hover:animate-flip-horizontal">
          {icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 grow">
        {description}
      </p>
      
      {/* Learn More Link */}
      <Link href="#" className="text-white font-semibold flex items-center gap-2 hover:text-green-400 group-hover:gap-4 transition-all mt-auto">
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
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Track Meta Ads Performance',
      description: 'View your clients\' ad spending, campaigns, and ROI in real-time. Beautiful charts and metrics that tell the whole story.',
      iconColor: 'bg-blue-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Built-in Messaging System',
      description: 'Chat with clients directly in the platform. Send text messages, voice notes, and files - all in one place.',
      iconColor: 'bg-green-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      title: 'Share Reports & Files Easily',
      description: 'Upload and share reports, creative assets, and documents with clients. Drag-and-drop simplicity.',
      iconColor: 'bg-purple-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: 'Beautiful Dashboards',
      description: 'Show clients their ROI with stunning charts and reports. Export to PDF with one click.',
      iconColor: 'bg-cyan-400',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-32 bg-linear-to-b from-purple-50 to-white mx-auto mt-6 sm:mt-10 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Everything You Need to Manage Clients
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Powerful features to streamline your agency workflow
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {allFeatures.map((feature, index) => (
            <div 
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
    </section>
  );
};