'use client';

import { useState } from 'react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does Meta Ads integration work?',
      answer: 'Clients securely connect their Meta Ads account via OAuth. You get read-only access to view spending data. No passwords are shared.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use bank-level encryption (SSL/TLS), secure data storage, and comply with GDPR standards.'
    },
    {
      question: 'Can I customize the dashboard?',
      answer: 'Yes, you can add your agency logo and brand colors to give clients a white-label experience.'
    },
    {
      question: 'What if my client has multiple ad accounts?',
      answer: 'No problem! Clients can connect multiple Meta Ads accounts and switch between them easily.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! Try our platform free for 14 days. No credit card required.'
    },
    {
      question: 'Can clients create or edit ads?',
      answer: 'No, this is a reporting and communication platform. Clients can only view their ad performance data, not create or edit ads.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-linear-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-12 sm:mb-16">
          Answers to Your Frequently<br className="hidden sm:block" />Asked Questions
        </h2>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6" suppressHydrationWarning>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={`faq-${index}`}
                className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                <span className="font-medium text-gray-900 text-base sm:text-lg flex-1">
                  {faq.question}
                </span>
                <span className="text-xl sm:text-2xl text-gray-600 shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                  +
                </span>
              </button>
              
              {/* Answer */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen ? '200px' : '0px',
                  opacity: isOpen ? 1 : 0
                }}
              >
                <p className="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
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
