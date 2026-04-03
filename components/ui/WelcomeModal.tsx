'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

const WELCOME_SETTINGS_CACHE_KEY = 'mb_welcome_modal_settings_v1';

type WelcomeSettings = {
  welcomeModalImage?: string | null;
  welcomeModalExploreLink?: string | null;
};

const getCachedWelcomeSettings = (): WelcomeSettings => {
  if (typeof window === 'undefined') return {};
  try {
    const cached = localStorage.getItem(WELCOME_SETTINGS_CACHE_KEY);
    if (!cached) return {};
    return JSON.parse(cached) as WelcomeSettings;
  } catch {
    return {};
  }
};

export const WelcomeModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalImage, setModalImage] = useState(() => getCachedWelcomeSettings().welcomeModalImage || '');
  const [exploreLink, setExploreLink] = useState(() => getCachedWelcomeSettings().welcomeModalExploreLink || '/service');

  const applySettings = (data: WelcomeSettings) => {
    setModalImage(data.welcomeModalImage || '');
    setExploreLink(data.welcomeModalExploreLink || '/service');
  };

  useEffect(() => {
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

  if (!visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-transparent px-4"
      onClick={handleClose}
    >
      <div className="relative z-10 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute -top-2 right-0 z-20 h-8 w-8 rounded-full bg-white/90 text-gray-600 shadow transition-colors hover:text-red-500"
        >
          <X className="mx-auto h-4 w-4" />
        </button>

        <div className="w-full bg-transparent p-0">
          {modalImage ? (
            <div className="mx-auto flex max-h-[70vh] w-fit max-w-[92vw] items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalImage}
                alt="Welcome"
                className="block h-auto max-h-[70vh] w-auto max-w-full border-0 bg-transparent object-contain shadow-none"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          ) : (
            <span></span>
          )}

          <div className="mt-4 flex justify-center">
            <Link
              href={exploreLink}
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-7 py-2 text-base font-bold text-white shadow-xl transition-colors hover:bg-red-600"
            >
              Learn More
              <ArrowRight className="h-5 font-bold" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
