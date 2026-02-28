'use client';

import React, { useEffect, useState } from 'react';
import { AdminStore, ServiceItem } from '@/lib/admin/store';
import { ServiceIcon } from '@/lib/admin/icons';

const ServiceCard: React.FC<{ item: ServiceItem }> = ({ item }) => (
  <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col hover:shadow-lg transition-shadow">
    <div className={`w-16 h-16 ${item.iconColor} rounded-full flex items-center justify-center mb-6`}>
      <ServiceIcon iconType={item.iconType} />
    </div>
    <h3 className="text-gray-900 text-xl font-bold mb-4">{item.title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
  </div>
);

export const Service = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    setServices(AdminStore.getServices());
    const handler = () => setServices(AdminStore.getServices());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const first = services.slice(0, 3);
  const second = services.slice(3, 5);
  const rest = services.slice(5);

  return (
    <section className="py-20 lg:py-32 bg-white" id="service">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            GoSaas: Your All-in-One Solution<br />for Business Success
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            We offer a comprehensive platform with all the tools you need to streamline and grow your business efficiently.
          </p>
        </div>

        {first.length > 0 && (
          <div className={`grid gap-6 max-w-6xl mx-auto ${first.length < 3 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {first.map(s => <ServiceCard key={s.id} item={s} />)}
          </div>
        )}

        {second.length > 0 && (
          <div className={`grid gap-6 max-w-4xl mx-auto mt-6 ${second.length === 1 ? 'md:grid-cols-1 max-w-md' : 'md:grid-cols-2'}`}>
            {second.map(s => <ServiceCard key={s.id} item={s} />)}
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6">
            {rest.map(s => <ServiceCard key={s.id} item={s} />)}
          </div>
        )}
      </div>
    </section>
  );
};
