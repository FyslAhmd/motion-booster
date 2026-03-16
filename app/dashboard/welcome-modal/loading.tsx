import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import DashboardLoadingShell from '@/app/dashboard/_components/DashboardLoadingShell';

export default function Loading() {
  return (
    <DashboardLoadingShell>
      <AdminSectionSkeleton variant='editor' />
    </DashboardLoadingShell>
  );
}
