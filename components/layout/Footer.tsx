'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';
import { useLanguage } from '@/lib/lang/LanguageContext';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="page-reveal">
      {/* Main Footer */}
      <div style={{ background: '#000000' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1 card-reveal-left">
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
                {t('footer_brand_desc')}
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
            <div className="card-reveal-right page-delay-1">
              <h3 className="text-white font-bold text-lg mb-6 text-wave">{t('footer_contact')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FF2525] shrink-0 mt-0.5" />
                  <div className="text-gray-400 text-sm leading-relaxed">
                    {t('footer_head_office')}<br />
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
            <div className="card-reveal-left page-delay-1">
              <h3 className="text-white font-bold text-lg mb-6 text-wave">{t('footer_quick_links')}</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_home')}</Link></li>
                <li><Link href="/service" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_services')}</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_about')}</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_contact')}</Link></li>
                <li><Link href="/#faq" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_faq')}</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_blog')}</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">{t('footer_link_privacy')}</Link></li>
              </ul>
            </div>

            {/* Popular Services */}
            <div className="card-reveal-right page-delay-2">
              <h3 className="text-white font-bold text-lg mb-6 text-wave">{t('footer_popular_services')}</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/category/web-development" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_web')}</Link></li>
                <li><Link href="/category/graphics-design" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_graphics')}</Link></li>
                <li><Link href="/category/digital-marketing" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_marketing')}</Link></li>
                <li><Link href="/category/software-development" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_software')}</Link></li>
                <li><Link href="/category/video-animation" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_video')}</Link></li>
                <li><Link href="/category/mobile-app-development" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_mobile')}</Link></li>
                <li><Link href="/category/ui-ux-design" className="text-gray-400 hover:text-white transition-colors">{t('footer_svc_uiux')}</Link></li>
              </ul>
            </div>

            {/* Others */}
            <div className="card-reveal-left page-delay-2">
              <h3 className="text-white font-bold text-lg mb-6 text-wave">{t('footer_others')}</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer_other_facility')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer_other_achievement')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer_other_career')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer_other_freelancing')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer_other_feedback')}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 page-reveal page-delay-3" style={{ background: '#000000' }}>
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
              Copyright © {currentYear} Motion Booster. {t('footer_copyright')}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label={t('social_facebook_aria')}>
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label={t('social_linkedin_aria')}>
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label={t('social_youtube_aria')}>
                <Youtube className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label={t('social_instagram_aria')}>
                <Instagram className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};
