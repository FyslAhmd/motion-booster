import DashboardLoadingShell from '@/app/dashboard/_components/DashboardLoadingShell';

export default function Loading() {
  return (
    <DashboardLoadingShell>
      <div className="h-64 w-full rounded-2xl border border-gray-200 bg-white" />
    </DashboardLoadingShell>
  );
}
