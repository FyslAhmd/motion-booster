'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';

const DEFAULT_MODAL_TITLE = 'Welcome to Motion Booster! 👋';
const DEFAULT_MODAL_BODY = 'We help businesses grow with creative branding, motion graphics, web development & digital marketing.';
const WELCOME_SETTINGS_CACHE_KEY = 'mb_welcome_modal_settings_v1';

type WelcomeSettings = {
  welcomeModalImage?: string | null;
  welcomeModalExploreLink?: string | null;
  welcomeModalTitle?: string | null;
  welcomeModalBody?: string | null;
};

export const WelcomeModal = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [modalImage, setModalImage] = useState('');
  const [exploreLink, setExploreLink] = useState('/service');
  const [modalTitle, setModalTitle] = useState(DEFAULT_MODAL_TITLE);
  const [modalBody, setModalBody] = useState(DEFAULT_MODAL_BODY);
  const [imageLoaded, setImageLoaded] = useState(false);

  const applySettings = (data: WelcomeSettings) => {
    setModalImage(data.welcomeModalImage || '');
    setExploreLink(data.welcomeModalExploreLink || '/service');
    setModalTitle(data.welcomeModalTitle || DEFAULT_MODAL_TITLE);
    setModalBody(data.welcomeModalBody || DEFAULT_MODAL_BODY);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(WELCOME_SETTINGS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as WelcomeSettings;
        applySettings(parsed);
      } else {
        // Fallback for existing admin-local settings on the same browser.
        const adminSettingsRaw = localStorage.getItem('mb_admin_settings');
        if (adminSettingsRaw) {
          const adminSettings = JSON.parse(adminSettingsRaw) as WelcomeSettings;
          applySettings(adminSettings);
        }
      }
    } catch {
      // noop
    }

    fetch('/api/v1/cms/site-settings')
      .then((r) => r.json())
      .then((data) => {
        applySettings(data);
        try {
          localStorage.setItem(
            WELCOME_SETTINGS_CACHE_KEY,
            JSON.stringify({
              welcomeModalImage: data.welcomeModalImage || '',
              welcomeModalExploreLink: data.welcomeModalExploreLink || '/service',
              welcomeModalTitle: data.welcomeModalTitle || DEFAULT_MODAL_TITLE,
              welcomeModalBody: data.welcomeModalBody || DEFAULT_MODAL_BODY,
            }),
          );
        } catch {
          // noop
        }
      })
      .catch(() => {});

    const alreadyShown = sessionStorage.getItem('welcomeShown');
    if (!alreadyShown) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!modalImage) {
      setImageLoaded(false);
      return;
    }

    let done = false;
    const preload = new window.Image();
    preload.onload = () => {
      if (done) return;
      setImageLoaded(true);
    };
    preload.onerror = () => {
      if (done) return;
      setImageLoaded(true);
    };
    preload.src = modalImage;

    return () => {
      done = true;
    };
  }, [modalImage]);

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

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 px-4"
      onClick={handleClose}
    >
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
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
          <div className="relative w-full h-56">
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
            >
              <div className="text-center px-4">
                <div className="text-5xl mb-2">🚀</div>
                <h2 className="text-white text-xl font-extrabold leading-tight">Motion Booster</h2>
                <p className="text-white/80 text-xs mt-1">Your Digital Growth Partner</p>
              </div>
            </div>
            {modalImage.startsWith('data:') || modalImage.startsWith('/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={modalImage}
                alt="Promo"
                className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <Image
                src={modalImage}
                alt="Promo"
                fill
                sizes="(max-width: 640px) 100vw, 384px"
                priority
                className={`object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>
        ) : (
          <div
            className="w-full h-56 flex items-center justify-center"
            style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
          >
            <div className="text-center px-4">
              <div className="text-5xl mb-2">🚀</div>
              <h2 className="text-white text-xl font-extrabold leading-tight">Motion Booster</h2>
              <p className="text-white/80 text-xs mt-1">Your Digital Growth Partner</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-5 pt-4 pb-5">
          <h3 className="text-gray-900 text-base font-bold mb-1.5">{modalTitle}</h3>
          <p className="text-gray-500 text-xs leading-relaxed mb-4">
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
    </div>,
    document.body,
  );
};
