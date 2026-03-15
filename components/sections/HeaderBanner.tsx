'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from 'framer-motion';

const sliderImages = [
  {
    src: "/header1.jpeg",
    alt: "IT Training Students",
    badge: "South Asia's Best IT Institute",
    year: "Awarded 2024"
  },
  {
    src: "/header2.jpeg",
    alt: "Professional Training",
    badge: "45+ Trendy Courses",
    year: "Expert Mentors"
  },
  {
    src: "/header3.jpeg",
    alt: "Career Success",
    badge: "20000+ Students Enrolled",
    year: "Join Today"
  }
];

export const HeaderBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <motion.section
      className="relative w-full border-b border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Mobile Slider View */}
      <motion.div
        className="lg:hidden pt-6 pb-5 px-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
      >
        <motion.div
          className="relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        >
          <Image
            src={sliderImages[currentSlide].src}
            alt={sliderImages[currentSlide].alt}
            fill
            className="object-cover"
            priority
          />
          
          {/* Dots Navigation */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-red-500 w-6' : 'bg-white/70'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-4 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
        >
          <a
            href="/service"
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-red-700"
          >
            Browse Service
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-red-500 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Get Started
          </a>
        </motion.div>
      </motion.div>

      {/* Desktop Grid View */}
      <div 
        className="hidden lg:block pt-28 pb-10"
        style={{ background: "url('/banner_bg.png') center / cover no-repeat" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 mt-4 lg:grid-cols-5 items-center gap-10 relative z-10">
          {/* Left: Text & Badge */}
          <motion.div
            className="lg:col-span-2 w-full z-10 text-left flex flex-col justify-center md:items-start md:justify-center lg:min-h-90 xl:min-h-100"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold mb-3">
              ✓ Unleash Your Potential
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Become an IT Pro & Rule the{" "}
              <span className="text-red-500">Digital World</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              With a vision to turn manpower into assets, Motion Booster is ready
              to enhance your learning experience with skilled mentors and an
              updated curriculum. Pick your desired course from more than 45
              trendy options.
            </p>
            <div className="flex gap-3 mb-3">
              <a
                href="/service"
                className="inline-flex items-center gap-2 px-7 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Browse Service
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3 bg-white border border-red-500 text-red-600 font-semibold rounded-lg transition-all shadow hover:bg-red-50"
              >
                Get Started
              </a>
            </div>
          </motion.div>
          {/* Right: Image */}
          <motion.div
            className="lg:col-span-3 relative w-full"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            >
              <Image
                src="/header1.jpeg"
                alt="Motion Booster IT Training"
                width={1000}
                height={680}
                className="w-full lg:h-115 object-cover"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
