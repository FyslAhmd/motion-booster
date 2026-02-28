'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Hide Header and Footer on dashboard, admin, and forgot-password routes
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');
  const isForgotPassword = pathname === '/forgot-password';
  
  const shouldHideLayout = isDashboard || isAdmin || isForgotPassword;

  return (
    <>
      {!shouldHideLayout && <Header />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
};
