'use client';

import { useState } from 'react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What courses do you offer?',
      answer: 'We offer 45+ courses including Web Development, Graphic Design, Digital Marketing, Video Editing, App Development, and more. All courses are job-oriented and industry-relevant.'
    },
    {
      question: 'Do I need prior experience?',
      answer: 'No! Most of our courses are designed for beginners. We start from basics and gradually move to advanced topics with hands-on practice.'
    },
    {
      question: 'What is the course duration and fee?',
      answer: 'Course duration ranges from 3-6 months depending on the program. Fees vary by course. Contact us or visit our office for detailed information.'
    },
    {
      question: 'Do you provide job placement?',
      answer: 'Yes! We offer job placement support, career counseling, resume building, and interview preparation. Many of our students are now working at top companies.'
    },
    {
      question: 'Will I get a certificate?',
      answer: 'Absolutely! After successfully completing the course, you will receive an industry-recognized certificate from Motion Booster.'
    },
    {
      question: 'Can I attend classes online?',
      answer: 'We offer both online and offline batches. You can choose the mode that suits you best based on your location and schedule.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12 md:mb-16 px-4">
          Answers to Your Frequently<br className="hidden sm:block" />Asked Questions
        </h2>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6" suppressHydrationWarning>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={`faq-${index}`}
                className="faq-item bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start justify-between gap-3 sm:gap-4 text-left"
                >
                <span className="font-medium text-gray-900 text-sm sm:text-base md:text-lg flex-1">
                  {faq.question}
                </span>
                <span className="text-lg sm:text-xl md:text-2xl text-gray-600 shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
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
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-3 sm:mt-4 leading-relaxed">
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
