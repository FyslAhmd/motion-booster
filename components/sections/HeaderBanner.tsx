'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";

const sliderImages = [
  {
    src: "/hero_img_4.jpg",
    alt: "IT Training Students",
    badge: "South Asia's Best IT Institute",
    year: "Awarded 2024"
  },
  {
    src: "/hero_img_4.jpg",
    alt: "Professional Training",
    badge: "45+ Trendy Courses",
    year: "Expert Mentors"
  },
  {
    src: "/hero_img_4.jpg",
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
    <section
      className="relative w-full border-b border-gray-100 overflow-hidden"
    >
      {/* Mobile Slider View */}
      <div className="lg:hidden pt-4 pb-4 px-4">
        <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={sliderImages[currentSlide].src}
            alt={sliderImages[currentSlide].alt}
            fill
            className="object-cover"
            priority
          />
          
          {/* Badge Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-3 py-2 shadow-md flex items-center gap-2">
            <Image
              src="/sells-report.jpg"
              alt="Award"
              width={40}
              height={40}
              className="rounded-md border w-10 h-10"
            />
            <div>
              <div className="font-bold text-gray-800 text-xs">
                {sliderImages[currentSlide].badge}
              </div>
              <div className="text-[10px] text-gray-500">{sliderImages[currentSlide].year}</div>
            </div>
          </div>

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
        </div>
      </div>

      {/* Desktop Grid View */}
      <div 
        className="hidden lg:block pt-32 pb-16"
        style={{ background: "url('/banner_bg.png') center / cover no-repeat" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 mt-10 lg:grid-cols-5 items-center gap-12 relative z-10">
          {/* Left: Text & Badge */}
          <div className="lg:col-span-2 w-full z-10 text-left flex flex-col justify-center md:items-start md:justify-center lg:min-h-90 xl:min-h-100">
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
                href="/features"
                className="inline-flex items-center gap-2 px-7 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Browse Course
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 bg-white border border-red-500 text-red-600 font-semibold rounded-lg transition-all shadow hover:bg-red-50"
              >
                Join Free Seminar
              </a>
            </div>
          </div>
          {/* Right: Image with Badge Overlay */}
          <div className="lg:col-span-3 relative w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/hero_img_4.jpg"
                alt="Award Banner"
                width={1000}
                height={680}
                className="w-full lg:h-115 object-cover"
                priority
              />
              {/* Badge Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-4 py-2 shadow flex items-center gap-3">
                <Image
                  src="/sells-report.jpg"
                  alt="Award"
                  width={56}
                  height={56}
                  className="rounded-md border w-14 h-14"
                />
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    South Asia&apos;s Best IT Institute
                  </div>
                  <div className="text-xs text-gray-500">Awarded 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
