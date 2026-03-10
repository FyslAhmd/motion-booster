'use client';

import { useState, useEffect } from 'react';
import { AdminStore, FAQItem } from '@/lib/admin/store';

export const FAQ = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqs, setFAQs] = useState<FAQItem[]>([]);

  useEffect(() => {
    setFAQs(AdminStore.getFAQs());
    const handler = () => setFAQs(AdminStore.getFAQs());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section className="pt-0 pb-2 sm:pb-4 md:pb-6 lg:pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-10 md:mb-12 px-4">
          Answers to Your Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6" suppressHydrationWarning>
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="faq-item bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-start justify-between gap-4 sm:gap-5 text-left"
                >
                  <span className="font-semibold text-gray-900 text-base sm:text-lg md:text-xl flex-1 leading-relaxed">
                    {faq.question}
                  </span>
                  <span
                    className="text-2xl sm:text-3xl text-red-500 shrink-0 transition-transform duration-300 font-light"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? '250px' : '0px', opacity: isOpen ? 1 : 0 }}
                >
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-4 sm:mt-5 leading-loose">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
