'use client';

import Image from 'next/image';

export const Upgrade = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
      ),
      title: 'High-Quality Leads',
      description: 'Discover how to use AI-powered marketing tools to attract and convert more leads without relying on large marketing teams.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>
        </svg>
      ),
      title: 'Accelerate Sales',
      description: 'Start closing more deals faster and streamlining your sales process with HubSpot\'s AI-powered deal management tools.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: 'Create Customer Journey',
      description: 'Fuel the entire customer journey with context across formats and channels with all-in-one AI-powered content marketing software.',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Image */}
          <div className="relative">
            {/* Green Circle Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-green-200 rounded-full opacity-30"></div>
            
            {/* Main Image */}
            <div className="relative z-10">
              <Image
                src="/Illustration_6.png"
                alt="Business Person"
                width={500}
                height={500}
                className="w-full h-auto"
              />
            </div>

            {/* Sales Growth Card */}
            <div className="absolute top-8 left-8 bg-white rounded-2xl p-4 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Sales Growth</p>
              <p className="text-3xl font-bold text-gray-900">+28%</p>
              <div className="mt-2">
                <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path
                    d="M0,15 Q25,10 50,12 T100,8"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Team Card */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-4 shadow-xl min-w-70">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">James Young</p>
                      <p className="text-xs text-gray-500">Product Manager</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Sarah Wartencorpe</p>
                      <p className="text-xs text-gray-500">Lead Designer</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Upgrade Your Business with Our CRM Solution
            </h2>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
