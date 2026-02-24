'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check, ArrowRight, TrendingUp, Palette, Code, Globe, Video, Briefcase, Smartphone, Layers, Sparkles, Zap } from 'lucide-react';

interface ServiceCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  services: string[];
  category: string;
  slug: string;
}

const allServices: ServiceCard[] = [
  {
    id: 1,
    title: 'Digital Marketing Services',
    description: 'Grow your online presence and drive results with our comprehensive digital marketing solutions.',
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    gradient: 'from-green-700 via-green-600 to-emerald-500',
    category: 'Digital Marketing',
    slug: 'digital-marketing',
    services: [
      'Facebook & Instagram Ads Management',
      'Google Ads & Performance Max',
      'SEO Optimization & Link Building',
      'Content Marketing & Blog Writing',
      'Email Marketing Campaigns',
      'Google Analytics & Conversion Tracking',
    ],
  },
  {
    id: 2,
    title: 'Graphics Design Services',
    description: 'Creative design solutions that make your brand stand out and communicate effectively.',
    icon: <Palette className="w-8 h-8 text-white" />,
    gradient: 'from-purple-800 via-purple-700 to-purple-500',
    category: 'Graphics Design',
    slug: 'graphics-design',
    services: [
      'Logo Design & Brand Identity',
      'Social Media Graphics',
      'Digital Ad Banners & Animations',
      'Brochure & Flyer Design',
      'Product Packaging Design',
      'Motion Graphics & Logo Animation',
    ],
  },
  {
    id: 3,
    title: 'Software Development',
    description: 'Custom software solutions tailored to your business needs and workflows.',
    icon: <Code className="w-8 h-8 text-white" />,
    gradient: 'from-blue-800 via-blue-700 to-indigo-500',
    category: 'Software Development',
    slug: 'software-development',
    services: [
      'Custom Web Applications',
      'CRM & ERP Systems',
      'SaaS Platform Development',
      'API Development & Integration',
      'E-commerce Solutions',
      'Workflow Automation',
    ],
  },
  {
    id: 4,
    title: 'Web Development',
    description: 'Professional websites that are fast, responsive, and optimized for conversions.',
    icon: <Globe className="w-8 h-8 text-white" />,
    gradient: 'from-cyan-800 via-cyan-600 to-teal-500',
    category: 'Web Development',
    slug: 'web-development',
    services: [
      'Corporate & E-commerce Websites',
      'React.js & Next.js Development',
      'Node.js Backend Development',
      'WordPress & WooCommerce',
      'Progressive Web Apps (PWA)',
      'Website Maintenance & Support',
    ],
  },
  {
    id: 5,
    title: 'Video & Animation Services',
    description: 'Engaging video content and animations that tell your story effectively.',
    icon: <Video className="w-8 h-8 text-white" />,
    gradient: 'from-red-800 via-red-700 to-rose-500',
    category: 'Video & Animation',
    slug: 'video-animation',
    services: [
      'Corporate Video Production',
      'Explainer & Demo Videos',
      '2D & 3D Animation',
      'Video Editing & Color Grading',
      'Motion Graphics',
      'Drone Videography',
    ],
  },
  {
    id: 6,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',
    icon: <Smartphone className="w-8 h-8 text-white" />,
    gradient: 'from-pink-800 via-pink-700 to-rose-500',
    category: 'Mobile App',
    slug: 'mobile-app-development',
    services: [
      'iOS App Development (Swift)',
      'Android App Development (Kotlin)',
      'React Native & Flutter',
      'E-commerce Mobile Apps',
      'App Store Optimization (ASO)',
      'App Maintenance & Updates',
    ],
  },
  {
    id: 7,
    title: 'UI/UX Design Services',
    description: 'User-centered design that creates intuitive and engaging digital experiences.',
    icon: <Layers className="w-8 h-8 text-white" />,
    gradient: 'from-orange-700 via-orange-600 to-amber-500',
    category: 'UI/UX Design',
    slug: 'ui-ux-design',
    services: [
      'Website & App UI Design',
      'Wireframing & Prototyping',
      'User Research & Analysis',
      'Design System Creation',
      'Figma & Adobe XD Design',
      'Accessibility Design (WCAG)',
    ],
  },
  {
    id: 8,
    title: 'Branding & Creative',
    description: 'Build a memorable brand identity that resonates with your target audience.',
    icon: <Sparkles className="w-8 h-8 text-white" />,
    gradient: 'from-yellow-700 via-amber-600 to-yellow-500',
    category: 'Branding',
    slug: 'branding-creative',
    services: [
      'Brand Strategy & Positioning',
      'Logo Design & Redesign',
      'Brand Guidelines & Style Guide',
      'Company Profile Design',
      'Marketing Collateral',
      'Brand Asset Library',
    ],
  },
  {
    id: 9,
    title: 'Business Consulting',
    description: 'Strategic guidance to help your business grow and achieve digital transformation.',
    icon: <Briefcase className="w-8 h-8 text-white" />,
    gradient: 'from-indigo-800 via-indigo-700 to-violet-500',
    category: 'Business Consulting',
    slug: 'business-consulting',
    services: [
      'Digital Transformation Consulting',
      'Technology Stack Selection',
      'Growth Hacking Strategy',
      'Process Optimization',
      'Team Training Sessions',
      'Technical Documentation',
    ],
  },
  {
    id: 10,
    title: 'Specialized Services',
    description: 'Advanced technical services for complex integrations and optimizations.',
    icon: <Zap className="w-8 h-8 text-white" />,
    gradient: 'from-teal-800 via-teal-600 to-emerald-500',
    category: 'Specialized',
    slug: 'specialized-services',
    services: [
      'Payment Gateway Integration',
      'AWS & Cloud Platform Setup',
      'DevOps & CI/CD Pipeline',
      'Website Speed Optimization',
      'SSL Certificate & Security Audit',
      'Live Chat Integration',
    ],
  },
];

const tabs = ['All Services', 'Digital Marketing', 'Graphics Design', 'Software Development', 'Web Development', 'Video & Animation', 'Mobile App', 'UI/UX Design', 'Branding', 'Business Consulting', 'Specialized'];

export const PopularCourses = () => {
  const [activeTab, setActiveTab] = useState('All Services');
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const filteredServices = activeTab === 'All Services'
    ? allServices
    : allServices.filter((s) => s.category === activeTab);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  const handleTabClick = (tab: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tab);
    // Scroll the clicked tab into view
    const button = event.currentTarget;
    button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            Our Popular Services
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
            We provide comprehensive digital solutions to help your business grow. Explore our wide range of services tailored to meet your specific needs.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 md:mb-10">
          {/* Tabs Container */}
          <div ref={tabsScrollRef} className="flex gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth border-b border-gray-200 pb-3 sm:pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={(e) => handleTabClick(tab, e)}
                className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Service Cards with Arrows */}
        <div className="relative px-0 sm:px-8">
          {/* Left Arrow - hidden on mobile */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-red-200 bg-white text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-500 items-center justify-center transition-all shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 px-1 sm:px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="service-card shrink-0 w-72 sm:w-80 md:w-85 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group"
              >
                {/* Service Header with Gradient */}
                <div className={`relative p-4 sm:p-6 bg-linear-to-br ${service.gradient}`}>
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      {React.cloneElement(service.icon as React.ReactElement<{ className?: string }>, {
                        className: 'w-6 h-6 sm:w-8 sm:h-8 text-white'
                      })}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug flex-1">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Services List */}
                <div className="p-4 sm:p-5">
                  <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
                    {service.services.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-2.5">
                        <div className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* View More */}
                  <Link
                    href={`/category/${service.slug}`}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors group/link"
                  >
                    View All Services
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow - hidden on mobile */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-red-200 bg-white text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-500 items-center justify-center transition-all shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
