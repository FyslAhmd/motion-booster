'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CARD_SELECTOR = [
  '.category-card',
  '.service-card',
  '.achievement-stat-card',
  '.portfolio-card',
  '.feature-card',
  '.testimonial-review-card',
  '.faq-item',
  '.company-logo-item',
].join(', ');

export function HomePageGsap() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.querySelector<HTMLElement>('.home-motion-root');
    if (!root) return;

    let rafId = 0;
    const observer = new MutationObserver(() => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        registerCardReveals();
      });
    });

    const registerCardReveals = () => {
      const cards = root.querySelectorAll<HTMLElement>(CARD_SELECTOR);
      let created = 0;

      cards.forEach((card, index) => {
        if (card.dataset.motionRevealReady === '1') return;
        card.dataset.motionRevealReady = '1';
        created += 1;

        const isLogoCard = card.classList.contains('company-logo-item');
        gsap.from(card, {
          autoAlpha: 0,
          y: isLogoCard ? 14 : 24,
          scale: isLogoCard ? 0.95 : 0.98,
          duration: isLogoCard ? 0.5 : 0.62,
          delay: Math.min((index % 6) * 0.03, 0.15),
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            once: true,
          },
        });
      });

      if (created > 0) {
        ScrollTrigger.refresh();
      }
    };

    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const hero = root.querySelector<HTMLElement>(
        isDesktop ? '.home-hero-desktop' : '.home-hero-mobile',
      );

      if (hero) {
        const heroTimeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
        });
        heroTimeline
          .from(hero, { autoAlpha: 0, y: 26, duration: 0.82 })
          .from(
            hero.querySelectorAll('a, button'),
            { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.1 },
            '-=0.45',
          );
      }

      const sectionBlocks = gsap.utils.toArray<HTMLElement>('.home-block');
      sectionBlocks.forEach((block) => {
        if (block.classList.contains('home-hero-mobile') || block.classList.contains('home-hero-desktop')) {
          return;
        }

        gsap.from(block, {
          autoAlpha: 0,
          y: 54,
          duration: 0.84,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 86%',
            once: true,
          },
        });
      });

      registerCardReveals();
      observer.observe(root, { childList: true, subtree: true });
    }, root);

    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return null;
}

