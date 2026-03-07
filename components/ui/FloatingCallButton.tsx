'use client';

import { useState, useEffect } from 'react';
import { Phone, X, ArrowUp } from 'lucide-react';

export const FloatingCallButton = () => {
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating buttons — hidden on desktop (FloatingSocialButtons handles desktop) */}
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 lg:hidden">
        {/* Scroll to top arrow — shown when scrolled */}
        {scrolled && (
          <button
            onClick={scrollToTop}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 shadow-lg transition-colors hover:bg-red-600"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 text-white" />
          </button>
        )}
        {/* Contact Us button */}
        {scrolled ? (
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 shadow-lg transition-colors hover:bg-red-600"
            aria-label="Contact us"
          >
            <Phone className="h-5 w-5 text-white" />
          </button>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-red-600"
            aria-label="Contact us"
          >
            <Phone className="h-4 w-4" />
            <span>Contact Us</span>
          </button>
        )}
      </div>

      {/* Contact Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white px-6 pb-6 pt-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="mb-2 text-xl font-bold text-gray-900">Contact Us</h3>
            <p className="mb-4 text-sm text-gray-500 leading-relaxed">
              You are welcome to visit our office for any information related to Service. You can also reach us through the hotline number or messenger.
            </p>

            {/* Call icon image */}
            <div className="mb-5 flex justify-center">
              <img
                src="/call-icon.png"
                alt="Contact support"
                className="h-32 w-32 object-contain"
              />
            </div>

            {/* WhatsApp + Messenger row */}
            <div className="mb-3 flex gap-3">
              <a
                href="https://wa.me/8801790939394"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-green-500 bg-white py-2.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50"
              >
                {/* WhatsApp icon */}
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a
                href="https://m.me/motionboosterbd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-blue-500 bg-white py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                {/* Messenger icon */}
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
                </svg>
                Messenger
              </a>
            </div>

            {/* Phone button */}
            <a
              href="tel:+880 1790-939394"
               className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-base font-bold text-white transition-colors hover:bg-red-600"
            >
              <Phone className="h-5 w-5" />
              +880 1790-939394
            </a>
          </div>
        </div>
      )}
    </>
  );
};
