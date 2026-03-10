'use client';
import { ConfirmProvider } from '@/lib/admin/confirm';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}

