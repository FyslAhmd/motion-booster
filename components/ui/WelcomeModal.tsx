'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminStore } from '@/lib/admin/store';

export const WelcomeModal = () => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [modalImage, setModalImage] = useState('');
  const [exploreLink, setExploreLink] = useState('/service');
  const [modalTitle, setModalTitle] = useState('Welcome to Motion Booster! 👋');
  const [modalBody, setModalBody] = useState('We help businesses grow with creative branding, motion graphics, web development & digital marketing.');

  useEffect(() => {
    const settings = AdminStore.getSettings();
    setModalImage(settings.welcomeModalImage || '');
    setExploreLink(settings.welcomeModalExploreLink || '/service');
    setModalTitle(settings.welcomeModalTitle || 'Welcome to Motion Booster! 👋');
    setModalBody(settings.welcomeModalBody || 'We help businesses grow with creative branding, motion graphics, web development & digital marketing.');

    const alreadyShown = sessionStorage.getItem('welcomeShown');
    if (!alreadyShown) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) { handleClose(); return; }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, countdown]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('welcomeShown', '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-[260px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors shadow"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Banner image / gradient */}
        {modalImage ? (
          <div className="relative w-full h-32">
            {modalImage.startsWith('data:') || modalImage.startsWith('/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={modalImage} alt="Promo" className="w-full h-full object-cover" />
            ) : (
              <Image src={modalImage} alt="Promo" fill className="object-cover" />
            )}
          </div>
        ) : (
          <div
            className="w-full h-32 flex items-center justify-center"
            style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
          >
            <div className="text-center px-4">
              <div className="text-4xl mb-1">🚀</div>
              <h2 className="text-white text-base font-extrabold leading-tight">Motion Booster</h2>
              <p className="text-white/80 text-[10px] mt-0.5">Your Digital Growth Partner</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pt-3 pb-4">
          <h3 className="text-gray-900 text-sm font-bold mb-1">{modalTitle}</h3>
          <p className="text-gray-500 text-[11px] leading-relaxed mb-3">
            {modalBody}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-full border-2 border-red-400 flex items-center justify-center">
                <span className="text-red-500 font-bold text-[10px]">{countdown}</span>
              </div>
              <span className="text-[10px] text-gray-400">Auto close</span>
            </div>
            <Link
              href={exploreLink}
              onClick={handleClose}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full font-semibold text-[11px] transition-colors shadow"
            >
              Explore
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
