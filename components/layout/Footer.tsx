'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      {/* Main Footer */}
      <div style={{ background: '#000000' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <div className="relative w-44 h-11">
                  <Image
                    src="/Motion Booster White Logo-footer.svg"
                    alt="Motion Booster"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Empowering individuals and businesses with cutting-edge digital skills and services since 2018.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4 text-white" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FF2525] shrink-0 mt-0.5" />
                  <div className="text-gray-400 text-sm leading-relaxed">
                    Head Office<br />
                    New Market, Dhaka
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#FF2525] shrink-0 mt-0.5" />
                  <div className="text-gray-400 text-sm leading-relaxed">
                    +880 1790-939394
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#FF2525] shrink-0 mt-0.5" />
                  <a href="mailto:hello@motionbooster.com" className="text-gray-400 text-sm hover:text-white transition-colors">
                    hello@motionbooster.com
                  </a>
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
                <li><Link href="/#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
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
        <div className="border-t border-white/10" style={{ background: '#000000' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-40 h-10">
                <Image
                  src="/Motion Booster White Logo-footer.svg"
                  alt="Motion Booster Logo"
                  fill
                  className="object-contain"
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

    </footer>
  );
};
