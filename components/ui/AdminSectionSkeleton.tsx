import React from 'react';

type AdminSectionSkeletonVariant =
  | 'list'
  | 'table'
  | 'tableEmbedded'
  | 'grid'
  | 'editor'
  | 'meta'
  | 'overview'
  | 'chatThread'
  | 'inline';

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`} />;
}

export function AdminSectionSkeleton({
  variant,
}: {
  variant: AdminSectionSkeletonVariant;
}) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <Pulse className="h-4 w-4 rounded-full" />
        <Pulse className="h-3 w-24" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <Pulse className="h-6 w-6 rounded-lg" />
              <Pulse className="h-10 w-10 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-3 w-1/3" />
              </div>
              <Pulse className="h-7 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
            <Pulse className="h-11 w-11 rounded-xl" />
            <Pulse className="mt-3 h-4 w-3/5" />
            <Pulse className="mt-2 h-3 w-4/5" />
            <Pulse className="mt-4 h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'overview') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <Pulse className="h-4 w-24" />
              <Pulse className="mt-3 h-7 w-20" />
              <Pulse className="mt-3 h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <Pulse className="h-5 w-36" />
          <Pulse className="mt-4 h-56 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (variant === 'editor') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <Pulse className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            <Pulse className="h-10 w-full" />
            <Pulse className="h-10 w-full" />
            <Pulse className="h-24 w-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <Pulse className="h-5 w-36" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Pulse className="h-10 w-full" />
            <Pulse className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'meta') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white px-3 py-3">
              <Pulse className="mx-auto h-6 w-10" />
              <Pulse className="mx-auto mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <div className="mb-3 flex gap-2">
            <Pulse className="h-9 flex-1 rounded-lg" />
            <Pulse className="h-9 flex-1 rounded-lg" />
            <Pulse className="h-9 flex-1 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Pulse className="h-10 w-10 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Pulse className="h-4 w-3/5" />
                  <Pulse className="h-3 w-2/5" />
                </div>
                <Pulse className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'chatThread') {
    return (
      <div className="space-y-4 py-2">
        {Array.from({ length: 8 }).map((_, i) => {
          const mine = i % 2 === 1;
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <Pulse className={`h-12 ${mine ? 'w-44' : 'w-52'} rounded-2xl`} />
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'tableEmbedded') {
    return (
      <div className="px-4 py-4 sm:px-6">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-3 w-1/3" />
              </div>
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Pulse className="h-10 w-full" />
          <Pulse className="h-10 w-full" />
          <Pulse className="h-10 w-full" />
        </div>
        <div className="space-y-3 pt-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-3/5" />
                <Pulse className="h-3 w-2/5" />
              </div>
              <Pulse className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
