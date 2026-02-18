'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Hide Header and Footer on dashboard routes and auth pages
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  
  const shouldHideLayout = isDashboard || isAuthPage;

  return (
    <>
      {!shouldHideLayout && <Header />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
};
