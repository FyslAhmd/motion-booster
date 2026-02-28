'use client';

import { useState, useEffect } from 'react';
import { Phone, ArrowUp } from 'lucide-react';

export const FloatingCallButton = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden fixed right-4 bottom-20 z-50 flex items-center gap-3">
      {/* Scroll to Top Button */}
      {scrolled && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Call Button */}
      <a
        href="tel:+8801790939394"
        className="transition-all duration-300"
        aria-label="Call us"
      >
        {scrolled ? (
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <Phone className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm">
            <Phone className="w-4 h-4" />
            <span>Hello</span>
          </div>
        )}
      </a>
    </div>
  );
};
