'use client';

import { useState } from 'react';

export const CTA = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Email submitted:', email);
  };

  return (
    <section className="relative py-20 lg:py-32 bg-purple-600 overflow-hidden">
      {/* Green Circle Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-12 leading-tight">
          Boost Sales. Build Lasting Relationships.<br />
          Achieve Faster Growth Today!
        </h2>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex items-center justify-center">
          <div className="flex items-center bg-white rounded-full shadow-xl overflow-hidden max-w-2xl w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-8 py-4 text-gray-900 placeholder-gray-500 focus:outline-none text-base"
              required
            />
            <button
              type="submit"
              className="bg-gray-900 text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Get Started Now!
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
