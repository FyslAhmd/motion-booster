'use client';

import { useState } from 'react';
import { Linkedin, Facebook, Youtube, Instagram, MessageCircle, X } from 'lucide-react';

const socials = [
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
];

export const FloatingSocialButtons = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="hidden lg:flex fixed bottom-6 right-3 z-40 flex-col items-end gap-3">

      {/* Social icons — animate in/out above chat button */}
      <div className="flex flex-col items-center gap-3">
        {socials.map(({ icon: Icon, label, href }, i) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            style={{
              transitionDelay: open ? `${i * 60}ms` : `${(socials.length - 1 - i) * 40}ms`,
              transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.6)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
            }}
            className="w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>

      {/* Chat toggle button — always visible */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle social links"
        className="w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
};
