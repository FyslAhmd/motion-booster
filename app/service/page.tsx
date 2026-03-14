'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { CategoryIcon } from '@/lib/admin/categoryIcons';
import { ServiceCategoryListSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';

interface PopularServiceItem {
  id: string;
  title: string;
  description: string;
  gradient: string;
  category: string;
  services: string[];
}

interface ServiceCategoryProps {
  iconType: string;
  title: string;
  description: string;
  services: string[];
  gradient: string;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ iconType, title, description, services, gradient }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div
        className={`p-6 bg-linear-to-br ${gradient} cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="shrink-0">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                <CategoryIcon iconType={iconType} className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/90 leading-relaxed text-sm">{description}</p>
            </div>
          </div>
          <button className={`ml-4 mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-2 text-gray-700">
                <Check className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <span className="text-sm">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ServicePage() {
  const [serviceCategories, setServiceCategories] = useState<PopularServiceItem[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/popular-services')
      .then(r => r.json())
      .then(data => setServiceCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setServiceLoading(false));
  }, []);

  return (
    <main className="min-h-screen pb-16 lg:pb-0">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Complete Digital Solutions
              <span className="block text-red-600">
                Under One Roof
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              From strategy to execution - we build and grow your digital presence with end-to-end services tailored to your business needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold border-2 border-gray-200 hover:border-red-500 hover:text-red-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Click on any service category to explore what we offer
            </p>
          </div>

          {serviceLoading ? (
            <ServiceCategoryListSkeleton />
          ) : (
            <div className="space-y-6">
              {serviceCategories.map((category) => (
                <ServiceCategory
                  key={category.id}
                  iconType={category.category}
                  title={category.title}
                  description={category.description}
                  services={category.services}
                  gradient={category.gradient}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Process
            </h2>
            <p className="text-xl text-gray-600">
              How we deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your goals and requirements' },
              { step: '02', title: 'Planning', desc: 'Strategy development and roadmap creation' },
              { step: '03', title: 'Production', desc: 'Agile development with regular updates' },
              { step: '04', title: 'Launch', desc: 'Testing, deployment, and go-live support' },
              { step: '05', title: 'Support', desc: 'Ongoing maintenance and optimization' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-red-500 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-red-600 overflow-hidden">
        {/* Red Circle Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-red-700 rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to Start Your Project?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90">
            Let's discuss how we can help bring your vision to life
          </p>
          <div className="flex justify-center mb-6">
            <Link
              href="/contact"
              className="bg-white text-red-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Contact Us Today
            </Link>
          </div>
          <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
            Free consultation • Fast turnaround
          </p>
          <p className="text-white text-xs sm:text-sm opacity-70">
            Questions? Contact us at{' '}
            <a href="mailto:hello@motionbooster.com" className="underline hover:opacity-100">
              hello@motionbooster.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
