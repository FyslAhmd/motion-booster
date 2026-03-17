'use client';

import { useEffect } from 'react';

export default function ScrollRevealInitializer() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      },
    );

    const prepareWaveText = (el: HTMLElement) => {
      if (el.dataset.waveReady === '1') return;
      if (el.children.length > 0) return;
      const rawText = (el.textContent || '').trim();
      if (!rawText) return;

      el.dataset.waveReady = '1';
      el.setAttribute('aria-label', rawText);
      el.textContent = '';

      const frag = document.createDocumentFragment();
      Array.from(rawText).forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'wave-char';
        span.style.setProperty('--char-index', String(index));
        span.textContent = char === ' ' ? '\u00A0' : char;
        frag.appendChild(span);
      });
      el.appendChild(frag);
    };

    const bindReveal = (el: HTMLElement) => {
      if (el.dataset.revealBound === '1') return;
      if (el.classList.contains('text-wave')) {
        prepareWaveText(el);
      }
      el.dataset.revealBound = '1';
      observer.observe(el);
    };

    const scanAndBind = (root: ParentNode = document) => {
      const elements = Array.from(
        root.querySelectorAll<HTMLElement>('.page-reveal, .card-reveal-left, .card-reveal-right, .text-wave'),
      );
      elements.forEach(bindReveal);
    };

    scanAndBind();

    const mutationObserver = new MutationObserver(() => {
      scanAndBind();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
