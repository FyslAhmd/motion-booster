import React from 'react';

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`} />;
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5 sm:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <Pulse className="h-8 w-64" />
            <Pulse className="h-4 w-52" />
          </div>
          <div className="w-full max-w-52.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
            <Pulse className="h-3 w-28" />
            <Pulse className="mt-2 h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardQuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Pulse className="h-9 w-9 rounded-lg" />
          <Pulse className="mt-3 h-7 w-16" />
          <Pulse className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
