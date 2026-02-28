'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      {/* CTA Banner */}
      <div className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b1c14 0%, #2d1810 50%, #1f120c 100%)' }}>
        {/* Dot Pattern */}
        <div className="absolute top-4 left-4 grid grid-cols-6 gap-2 opacity-30">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>
        <div className="absolute top-4 right-4 grid grid-cols-6 gap-2 opacity-30">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            We Are Ready To Serve You
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Get in touch with us today, take one step ahead towards a successful digital presence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/service"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ background: '#2d1810' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-gray-400 text-sm leading-relaxed">
                    Head Office<br />
                    New Market, Dhaka
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-gray-400 text-sm leading-relaxed">
                    +880 1790-939394
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">info@motionbooster.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/service" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Popular Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Popular Services</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/category/web-development" className="text-gray-400 hover:text-white transition-colors">Web Development</Link></li>
                <li><Link href="/category/graphics-design" className="text-gray-400 hover:text-white transition-colors">Graphics Design</Link></li>
                <li><Link href="/category/digital-marketing" className="text-gray-400 hover:text-white transition-colors">Digital Marketing</Link></li>
                <li><Link href="/category/software-development" className="text-gray-400 hover:text-white transition-colors">Software Development</Link></li>
                <li><Link href="/category/video-animation" className="text-gray-400 hover:text-white transition-colors">Video & Animation</Link></li>
                <li><Link href="/category/mobile-app-development" className="text-gray-400 hover:text-white transition-colors">Mobile App Development</Link></li>
                <li><Link href="/category/ui-ux-design" className="text-gray-400 hover:text-white transition-colors">UI/UX Design</Link></li>
              </ul>
            </div>

            {/* Others */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Others</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Our Facility</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Our Achievement</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Career Placement</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Freelancing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Client Feedback</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-40 h-10">
                <Image
                  src="/Motion Booster Black Logo-01.svg"
                  alt="Motion Booster Logo"
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
            </Link>

            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center" suppressHydrationWarning>
              Copyright © {currentYear} Motion Booster. All right reserved.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="hidden lg:flex fixed bottom-8 right-4 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg items-center justify-center transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </footer>
  );
};
