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
      <section className="pt-8 pb-12 sm:py-16 lg:pt-28 lg:pb-14 bg-linear-to-br from-red-50 via-white to-rose-50">
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
      <section className="pt-10 pb-14 sm:py-16 lg:pt-12 lg:pb-16 bg-white">
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
      <section className="pt-12 pb-16 lg:pt-12 lg:pb-20 bg-gray-50">
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

    </main>
  );
}
