import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';
import DashboardLoadingShell from '@/app/dashboard/_components/DashboardLoadingShell';

export default function Loading() {
  return (
    <DashboardLoadingShell noPadding>
      <RouteLoadingSkeleton variant='chat' />
    </DashboardLoadingShell>
  );
}
