'use client';

import type { ReactNode } from 'react';
import AdminShell from './AdminShell';

export default function DashboardLoadingShell({
  children,
  noPadding = false,
}: {
  children: ReactNode;
  noPadding?: boolean;
}) {
  return <AdminShell noPadding={noPadding}>{children}</AdminShell>;
}
