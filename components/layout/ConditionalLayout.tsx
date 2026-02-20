'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Hide Header and Footer only on dashboard routes and forgot-password page
  const isDashboard = pathname?.startsWith('/dashboard');
  const isForgotPassword = pathname === '/forgot-password';
  
  const shouldHideLayout = isDashboard || isForgotPassword;

  return (
    <>
      {!shouldHideLayout && <Header />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
};
