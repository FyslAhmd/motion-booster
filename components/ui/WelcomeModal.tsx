'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

const WELCOME_SETTINGS_CACHE_KEY = 'mb_welcome_modal_settings_v1';

type WelcomeSettings = {
  welcomeModalImage?: string | null;
  welcomeModalExploreLink?: string | null;
};

export const WelcomeModal = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [exploreLink, setExploreLink] = useState('/service');
  const [imageLoaded, setImageLoaded] = useState(false);

  const applySettings = (data: WelcomeSettings) => {
    setModalImage(data.welcomeModalImage || '');
    setExploreLink(data.welcomeModalExploreLink || '/service');
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
      }
    } catch {
      // noop
    }

    fetch('/api/v1/cms/site-settings')
      .then((r) => r.json())
      .then((data) => {
        const next = {
          welcomeModalImage: data?.welcomeModalImage || '',
          welcomeModalExploreLink: data?.welcomeModalExploreLink || '/service',
        };
        applySettings(next);
        try {
          localStorage.setItem(WELCOME_SETTINGS_CACHE_KEY, JSON.stringify(next));
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
      setImageLoaded(true);
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

    const autoCloseTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('welcomeShown', '1');
    }, 10000);

    return () => clearTimeout(autoCloseTimer);
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('welcomeShown', '1');
  };

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/65 px-4"
      onClick={handleClose}
    >
      <div className="relative z-10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute -top-2 right-0 z-20 h-8 w-8 rounded-full bg-white/90 text-gray-600 shadow transition-colors hover:text-red-500"
        >
          <X className="mx-auto h-4 w-4" />
        </button>

        <div className="w-full rounded-2xl bg-transparent p-4 shadow-2xl backdrop-blur-[1px]">
          {modalImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={modalImage}
              alt="Welcome"
              className={`mx-auto h-64 w-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          ) : (
            <div
              className="mx-auto flex h-64 w-full items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
            >
              <div className="text-center px-4">
                <div className="mb-2 text-5xl">🚀</div>
                <h2 className="text-xl font-extrabold leading-tight text-white">Motion Booster</h2>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <Link
              href={exploreLink}
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-7 py-3 text-base font-bold text-white shadow-xl transition-colors hover:bg-red-600"
            >
              Explore
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
