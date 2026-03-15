'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import PageTransition from '@/components/ui/PageTransition';

export const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Hide Header and Footer on dashboard, admin, and forgot-password routes
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');
  const isForgotPassword = pathname === '/forgot-password';
  
  const shouldHideLayout = isDashboard || isAdmin || isForgotPassword;
  const isHandledByAdminShell = isDashboard || isAdmin;
  const content = isHandledByAdminShell ? (
    children
  ) : (
    <PageTransition variant="public">{children}</PageTransition>
  );

  return (
    <>
      {!shouldHideLayout && <Header />}
      {content}
      {!shouldHideLayout && <Footer />}
    </>
  );
};
