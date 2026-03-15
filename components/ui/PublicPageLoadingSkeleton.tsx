'use client';

import React from 'react';

type PublicPageSkeletonVariant =
  | 'about'
  | 'features'
  | 'service'
  | 'blog'
  | 'contact'
  | 'team';

function Pulse({ className }: { className: string }) {
  return <div className={`skeleton-breathe rounded-xl bg-gray-200/80 ${className}`} />;
}

function HeroSkeleton() {
  return (
    <section className="bg-linear-to-br from-red-50 via-white to-rose-50 px-4 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl text-center">
        <Pulse className="mx-auto h-5 w-40 rounded-full" />
        <Pulse className="mx-auto mt-6 h-12 w-full max-w-3xl" />
        <Pulse className="mx-auto mt-3 h-12 w-full max-w-2xl" />
        <Pulse className="mx-auto mt-5 h-4 w-full max-w-2xl" />
        <Pulse className="mx-auto mt-8 h-12 w-72" />
      </div>
    </section>
  );
}

function TeamCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <Pulse className="mx-auto h-24 w-24 rounded-full" />
          <Pulse className="mx-auto mt-6 h-6 w-40" />
          <Pulse className="mx-auto mt-3 h-4 w-28" />
          <Pulse className="mx-auto mt-6 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PublicPageLoadingSkeleton({
  variant,
}: {
  variant: PublicPageSkeletonVariant;
}) {
  if (variant === 'about') {
    return (
      <main className="min-h-screen bg-white">
        <HeroSkeleton />

        <section className="bg-gray-900 px-4 py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-800 bg-gray-800/50 p-5 text-center">
                <Pulse className="mx-auto h-8 w-20 bg-gray-600/70" />
                <Pulse className="mx-auto mt-3 h-4 w-24 bg-gray-600/70" />
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div className="space-y-3">
              <Pulse className="h-10 w-56" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-11/12" />
              <Pulse className="h-4 w-10/12" />
              <Pulse className="h-4 w-9/12" />
            </div>
            <div className="rounded-3xl bg-red-100 p-8">
              <Pulse className="mx-auto h-14 w-14 rounded-full" />
              <Pulse className="mx-auto mt-4 h-6 w-40" />
              <Pulse className="mx-auto mt-4 h-4 w-11/12" />
              <Pulse className="mx-auto mt-2 h-4 w-10/12" />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <Pulse className="mx-auto h-9 w-64" />
              <Pulse className="mx-auto mt-3 h-4 w-72" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-900 p-8">
                  <Pulse className="h-14 w-14 bg-gray-700/80" />
                  <Pulse className="mt-6 h-6 w-32 bg-gray-700/80" />
                  <Pulse className="mt-3 h-4 w-full bg-gray-700/80" />
                  <Pulse className="mt-2 h-4 w-11/12 bg-gray-700/80" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <Pulse className="mx-auto h-8 w-44 rounded-full" />
              <Pulse className="mx-auto mt-4 h-10 w-80" />
              <Pulse className="mx-auto mt-4 h-4 w-96 max-w-full" />
            </div>
            <TeamCardsSkeleton />
          </div>
        </section>
      </main>
    );
  }

  if (variant === 'features') {
    return (
      <main className="min-h-screen bg-white">
        <HeroSkeleton />

        <section className="px-4 py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-10 w-32 rounded-lg" />
            ))}
          </div>
        </section>

        <section className="px-4 py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-8">
                <Pulse className="h-14 w-14" />
                <Pulse className="mt-6 h-6 w-4/5" />
                <Pulse className="mt-3 h-4 w-full" />
                <Pulse className="mt-2 h-4 w-11/12" />
                <div className="mt-6 space-y-3">
                  <Pulse className="h-4 w-10/12" />
                  <Pulse className="h-4 w-9/12" />
                  <Pulse className="h-4 w-8/12" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-lg text-center">
              <Pulse className="mx-auto h-9 w-72" />
              <Pulse className="mx-auto mt-3 h-4 w-80 max-w-full" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-6">
                  <Pulse className="h-12 w-12" />
                  <Pulse className="mt-4 h-5 w-2/3" />
                  <Pulse className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (variant === 'service') {
    return (
      <main className="min-h-screen bg-white pb-16 lg:pb-0">
        <HeroSkeleton />

        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-lg text-center">
              <Pulse className="mx-auto h-10 w-56" />
              <Pulse className="mx-auto mt-3 h-4 w-80 max-w-full" />
            </div>
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <Pulse className="h-14 w-14 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <Pulse className="h-6 w-56 max-w-full" />
                        <Pulse className="h-4 w-full" />
                        <Pulse className="h-4 w-10/12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-lg text-center">
              <Pulse className="mx-auto h-10 w-56" />
              <Pulse className="mx-auto mt-3 h-4 w-72 max-w-full" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Pulse className="mx-auto h-20 w-20 rounded-full" />
                  <Pulse className="mx-auto mt-4 h-5 w-24" />
                  <Pulse className="mx-auto mt-3 h-4 w-32 max-w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (variant === 'blog') {
    return (
      <main className="min-h-screen bg-white pb-16 lg:pb-0">
        <HeroSkeleton />
        <section className="px-4 py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <Pulse className="h-11 w-full" />
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <Pulse className="h-6 w-32" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Pulse className="h-4 w-4 rounded-md" />
                      <Pulse className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <Pulse className="h-6 w-32" />
                <div className="mt-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Pulse className="h-4 w-full" />
                      <Pulse className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <Pulse className="h-48 w-full rounded-none" />
                    <div className="space-y-3 p-6">
                      <Pulse className="h-4 w-2/3" />
                      <Pulse className="h-6 w-full" />
                      <Pulse className="h-4 w-full" />
                      <Pulse className="h-4 w-11/12" />
                      <Pulse className="h-9 w-28 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (variant === 'contact') {
    return (
      <main className="min-h-screen bg-white pb-16 lg:pb-0">
        <HeroSkeleton />

        <section className="bg-white px-4 py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <Pulse className="h-8 w-64" />
              <Pulse className="h-4 w-full" />
              <div className="h-[340px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <Pulse className="h-full w-full" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-red-50 p-4">
                  <Pulse className="h-5 w-32" />
                  <Pulse className="mt-2 h-4 w-40 max-w-full" />
                </div>
                <div className="rounded-xl bg-red-50 p-4">
                  <Pulse className="h-5 w-32" />
                  <Pulse className="mt-2 h-4 w-40 max-w-full" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <Pulse className="h-8 w-56" />
              <Pulse className="mt-2 h-4 w-72 max-w-full" />
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Pulse className="h-11 w-full" />
                  <Pulse className="h-11 w-full" />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Pulse className="h-11 w-full" />
                  <Pulse className="h-11 w-full" />
                </div>
                <Pulse className="h-28 w-full" />
                <Pulse className="h-12 w-full" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20 lg:pb-0 lg:pt-32">
      <div className="sticky top-0 z-30 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Pulse className="h-6 w-6 rounded-md" />
          <Pulse className="h-6 w-32" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-4">
        <div className="rounded-2xl bg-gray-100 p-4">
          <div className="flex items-center gap-4">
            <Pulse className="h-28 w-28 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <Pulse className="h-6 w-48 max-w-full" />
              <Pulse className="h-4 w-40 max-w-full" />
              <Pulse className="h-4 w-56 max-w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-gray-100">
              <Pulse className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Pulse className="h-4 w-full" />
                <Pulse className="h-3 w-3/4" />
                <Pulse className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function AboutTeamGridSkeleton() {
  return <TeamCardsSkeleton />;
}

export function ServiceCategoryListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Pulse className="h-14 w-14 shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <Pulse className="h-6 w-56 max-w-full" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-10/12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamPageCardsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gray-100 p-4">
        <div className="flex items-center gap-4">
          <Pulse className="h-28 w-28 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-3">
            <Pulse className="h-6 w-48 max-w-full" />
            <Pulse className="h-4 w-40 max-w-full" />
            <Pulse className="h-4 w-56 max-w-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-gray-100">
            <Pulse className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-3 w-3/4" />
              <Pulse className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <Pulse className="h-11 w-full" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <Pulse className="h-6 w-32" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Pulse className="h-4 w-4 rounded-md" />
                <Pulse className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <Pulse className="h-6 w-32" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Pulse className="h-4 w-full" />
                <Pulse className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <Pulse className="h-48 w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-6 w-full" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-11/12" />
                <Pulse className="h-9 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
