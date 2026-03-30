'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingSocialButtons } from '@/components/ui/FloatingSocialButtons';
import { FloatingCallButton } from '@/components/ui/FloatingCallButton';

export const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Hide Header and Footer on dashboard, admin, and forgot-password routes
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');
  const isForgotPassword = pathname?.startsWith('/forgot-password');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isInvoice = pathname === '/invoice';

  const shouldHideLayout = isDashboard || isAdmin || isForgotPassword || isInvoice;
  const isHandledByAdminShell = isDashboard || isAdmin || isInvoice;
  const shouldHideFooter = shouldHideLayout;
  const shouldHideFloaters = isDashboard || isAuthPage;
  const content = isHandledByAdminShell ? (
    children
  ) : (
    <div key={pathname} className="page-reveal">{children}</div>
  );

  return (
    <>
      {!shouldHideLayout && <Header />}
      {!shouldHideFloaters && <FloatingSocialButtons />}
      {!shouldHideFloaters && <FloatingCallButton />}
      {content}
      {!shouldHideFooter && <Footer />}
    </>
  );
};
