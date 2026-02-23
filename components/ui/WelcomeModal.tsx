'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

export const WelcomeModal = () => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Show after 0.5s on first visit per session
    const alreadyShown = sessionStorage.getItem('welcomeShown');
    if (!alreadyShown) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) {
      handleClose();
      return;
    }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [visible, countdown]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('welcomeShown', '1');
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center px-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors shadow"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image area */}
          <div
            className="w-full h-52 flex items-center justify-center"
            style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
          >
            <div className="text-center px-6">
              <div className="text-6xl mb-2">🚀</div>
              <h2 className="text-white text-2xl font-extrabold leading-tight">Motion Booster</h2>
              <p className="text-white/80 text-sm mt-1">Your Digital Growth Partner</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-5 pb-6">
            <h3 className="text-gray-900 text-lg font-bold mb-2">
              Welcome to Motion Booster! 👋
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              We help businesses grow with creative branding, motion graphics, web development & digital marketing. Let&apos;s build something amazing together.
            </p>

            <div className="flex items-center justify-between">
              {/* Countdown */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center">
                  <span className="text-red-500 font-bold text-sm">{countdown}</span>
                </div>
                <span className="text-xs text-gray-400">Auto close</span>
              </div>

              {/* CTA Arrow */}
              <Link
                href="/service"
                onClick={handleClose}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow"
              >
                Explore
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
