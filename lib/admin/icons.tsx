'use client';

import React from 'react';

export function ServiceIcon({ iconType, className = 'w-8 h-8 text-white' }: { iconType: string; className?: string }) {
  const stroke = { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' };
  const sw = 2;
  switch (iconType) {
    case 'document':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'calendar':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'list':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
    case 'chart':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
    case 'sync':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
    case 'users':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'star':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
    case 'check':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'globe':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'lock':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
    case 'lightning':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'rocket':
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56-5.84L21 3M3 21l4.5-4.5" /></svg>;
    default:
      return <svg className={className} {...stroke}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
  }
}
