import React from 'react';

type SkeletonVariant = 'overview' | 'table' | 'editor' | 'chat' | 'meta';

function PulseBlock({ className }: { className: string }) {
  return <div className={`skeleton-breathe rounded-xl bg-gray-200/80 ${className}`} />;
}

export function RouteLoadingSkeleton({ variant }: { variant: SkeletonVariant }) {
  if (variant === 'overview') {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <PulseBlock className="h-8 w-56" />
          <PulseBlock className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <PulseBlock className="h-4 w-24" />
              <PulseBlock className="mt-3 h-7 w-20" />
              <PulseBlock className="mt-3 h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <PulseBlock className="h-5 w-40" />
            <PulseBlock className="mt-4 h-56 w-full rounded-2xl" />
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <PulseBlock className="h-5 w-44" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <PulseBlock className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <PulseBlock className="h-4 w-3/5" />
                    <PulseBlock className="h-3 w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <PulseBlock className="h-8 w-60" />
            <PulseBlock className="h-4 w-80" />
          </div>
          <PulseBlock className="h-10 w-36" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PulseBlock className="h-10 w-full" />
            <PulseBlock className="h-10 w-full" />
            <PulseBlock className="h-10 w-full" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <PulseBlock className="h-10 w-10 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <PulseBlock className="h-4 w-3/5" />
                  <PulseBlock className="h-3 w-2/5" />
                </div>
                <PulseBlock className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'editor') {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <PulseBlock className="h-8 w-56" />
          <PulseBlock className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <PulseBlock className="h-6 w-40" />
            <div className="mt-5 space-y-4">
              <PulseBlock className="h-11 w-full" />
              <PulseBlock className="h-11 w-full" />
              <PulseBlock className="h-11 w-full" />
              <PulseBlock className="h-28 w-full" />
              <PulseBlock className="h-11 w-44" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <PulseBlock className="h-6 w-32" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <PulseBlock className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <PulseBlock className="h-4 w-3/4" />
                    <PulseBlock className="h-3 w-2/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[320px_1fr]">
          <div className="border-r border-gray-100 p-4 space-y-3">
            <PulseBlock className="h-10 w-full" />
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <PulseBlock className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <PulseBlock className="h-4 w-3/5" />
                  <PulseBlock className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <PulseBlock className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <PulseBlock className="h-4 w-32" />
                  <PulseBlock className="h-3 w-20" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <PulseBlock className={`h-12 ${i % 2 === 0 ? 'w-56' : 'w-48'} rounded-2xl`} />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-4">
              <PulseBlock className="h-11 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <PulseBlock className="h-8 w-56" />
          <PulseBlock className="h-4 w-72" />
        </div>
        <PulseBlock className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <PulseBlock className="h-4 w-24" />
            <PulseBlock className="mt-4 h-7 w-20" />
            <PulseBlock className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <PulseBlock className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <PulseBlock className="h-4 w-3/5" />
                <PulseBlock className="h-3 w-2/5" />
              </div>
              <PulseBlock className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <PulseBlock className="h-5 w-32" />
          <PulseBlock className="mt-4 h-56 w-full rounded-2xl" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <PulseBlock className="h-5 w-36" />
          <div className="space-y-2">
            <PulseBlock className="mt-4 h-4 w-3/5" />
            <PulseBlock className="h-4 w-4/5" />
            <PulseBlock className="h-4 w-2/3" />
            <PulseBlock className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
    );
  }
