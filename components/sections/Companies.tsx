'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Companies = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.from(textRef.current, {
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 85%',
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    if (sectionRef.current) {
      const logos = sectionRef.current.querySelectorAll('.company-logo');
      gsap.from(logos, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, []);

  const companies = [
    { name: 'Google', logo: 'Google' },
    { name: 'Microsoft', logo: 'Microsoft' },
    { name: 'Amazon', logo: 'Amazon' },
    { name: 'Facebook', logo: 'Facebook' },
    { name: 'Apple', logo: 'Apple' },
    { name: 'IBM', logo: 'IBM' },
  ];

  return (
    <section ref={sectionRef} className="py-8 sm:py-10 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p ref={textRef} className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
          Our Students Are Working At Top Companies Worldwide
        </p>
        
        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-logo">
            {/* First set of logos */}
            {companies.map((company, index) => (
              <div key={`first-${index}`} className="company-logo shrink-0 mx-4 sm:mx-6 lg:mx-12">
                <div className="h-10 sm:h-12 flex items-center justify-center">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 italic" style={{ 
                    fontFamily: company.name === 'Lamborghini' ? 'serif' : 
                               company.name === 'Mosers' ? 'cursive' : 'sans-serif'
                  }}>
                    {company.logo}
                  </span>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {companies.map((company, index) => (
              <div key={`second-${index}`} className="shrink-0 mx-4 sm:mx-6 lg:mx-12">
                <div className="h-10 sm:h-12 flex items-center justify-center">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 italic" style={{ 
                    fontFamily: company.name === 'Lamborghini' ? 'serif' : 
                               company.name === 'Mosers' ? 'cursive' : 'sans-serif'
                  }}>
                    {company.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
