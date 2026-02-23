'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CTA = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
      },
    });

    tl.from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    })
    .from(descRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
    }, '-=0.4')
    .from(buttonRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
    }, '-=0.3');

    // Animate circles
    if (circlesRef.current) {
      const circles = circlesRef.current.querySelectorAll('.cta-circle');
      gsap.to(circles, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });
    }
  }, []);

  return (
    <section className="relative py-16 sm:py-20 lg:py-32 bg-purple-600 overflow-hidden">
      {/* Green Circle Decorations */}
      <div ref={circlesRef}>
        <div className="cta-circle absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="cta-circle absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-green-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Ready to Start Your IT Career?
        </h2>

        <p ref={descRef} className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90">
          Join 20,000+ students who transformed their career with Motion Booster
        </p>

        {/* CTA Button */}
        <div ref={buttonRef} className="flex justify-center mb-6">
          <a
            href="/register"
            className="bg-white text-purple-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Enroll Now
          </a>
        </div>

        {/* Trust Badge */}
        <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
          Free seminar available • Flexible payment options
        </p>

        {/* Contact Info */}
        <p className="text-white text-xs sm:text-sm opacity-70">
          Have questions? Call us at{' '}
          <a href="tel:+8801790939394" className="underline hover:opacity-100">
            +880 1790-939394
          </a>
        </p>
      </div>
    </section>
  );
};
