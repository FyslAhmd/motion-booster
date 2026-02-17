'use client';

import { useState } from 'react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What data types does your analytics application support?',
      answer: 'Our analytics application supports a wide range of data types including numerical, categorical, time-series, and custom data formats. You can easily import data from CSV, Excel, databases, and APIs.'
    },
    {
      question: 'Do you offer a free trial of your analytics application?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start your trial.'
    },
    {
      question: 'Can I upgrade or downgrade my plan at any time?',
      answer: 'Absolutely! You can upgrade or downgrade your subscription plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Do you offer discounts for annual subscriptions?',
      answer: 'Yes, we offer up to 20% discount for annual subscriptions compared to monthly billing. Contact our sales team for enterprise pricing options.'
    },
    {
      question: 'What support options are available if I need help?',
      answer: 'We provide 24/7 email support, live chat during business hours, comprehensive documentation, video tutorials, and dedicated account managers for enterprise customers.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes! Our mobile app is available for both iOS and Android devices, allowing you to access your analytics and reports on the go.'
    },
    {
      question: 'What are benefits of using your analytics application?',
      answer: 'Key benefits include real-time data insights, customizable dashboards, automated reporting, seamless integrations, data-driven decision making, and improved business efficiency.'
    },
    {
      question: 'Is there any future prediction for business?',
      answer: 'Yes! Our platform includes advanced predictive analytics and AI-powered forecasting tools to help you anticipate trends and make proactive business decisions.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-32 bg-linear-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-16">
          Answers to Your Frequently<br />Asked Questions
        </h2>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-6" suppressHydrationWarning>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={`faq-${index}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                <span className="font-medium text-gray-900 text-lg flex-1">
                  {faq.question}
                </span>
                <span className="text-2xl text-gray-600 shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
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
                <p className="text-gray-600 mt-4 leading-relaxed">
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
