'use client';

import React from 'react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, iconColor }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col hover:shadow-lg transition-shadow">
      {/* Icon */}
      <div className={`w-16 h-16 ${iconColor} rounded-full flex items-center justify-center mb-6`}>
        <div className="hover:flip-horizontal">
          {icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-gray-900 text-xl font-bold mb-4">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const Service = () => {
  const services = [
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Easy Task Creation',
      description: 'Add new tasks quickly with a simple and user-friendly interface. Organize your workload without the hassle.',
      iconColor: 'bg-purple-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Due Date & Reminders',
      description: 'Set due dates and reminders to ensure you meet your deadlines. Get notified via email or in-app alerts.',
      iconColor: 'bg-green-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      title: 'Customizable Lists',
      description: 'Customize task lists to match your unique workflow. Group tasks by project, priority, or deadline to stay on top of everything.',
      iconColor: 'bg-cyan-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Progress Tracking',
      description: 'Visualize your progress with intuitive dashboards and progress bars. Keep track of completed and pending tasks effortlessly.',
      iconColor: 'bg-cyan-400',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Cross Platform Sync',
      description: 'Access your tasks from any device. Our application syncs across web, mobile, and desktop to keep you connected.',
      iconColor: 'bg-green-400',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white" id="service">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            GoSaas: Your All-in-One Solution<br />for Business Success
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            We offers a comprehensive platform with all the tools you need to streamline and grow your business efficiently.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* First Row - 3 cards */}
          {services.slice(0, 3).map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              iconColor={service.iconColor}
            />
          ))}
        </div>

        {/* Second Row - 2 cards centered */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
          {services.slice(3, 5).map((service, index) => (
            <ServiceCard
              key={index + 3}
              icon={service.icon}
              title={service.title}
              description={service.description}
              iconColor={service.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
