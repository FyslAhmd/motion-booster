'use client';

import React from 'react';
import type { MetaAd } from './useMetaData';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-yellow-500/20 text-yellow-400',
  DELETED: 'bg-red-500/20 text-red-400',
  ARCHIVED: 'bg-gray-500/20 text-gray-400',
};

interface Props {
  ads: MetaAd[];
}

export default function AdsTable({ ads }: Props) {
  if (!ads.length) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-300">Ads</h3>
        <p className="text-sm text-gray-500">No ads found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50">
      <div className="border-b border-gray-700/50 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-300">
          Ads <span className="ml-1 text-xs text-gray-500">({ads.length})</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700/50 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Ad Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Creative Title</th>
              <th className="px-4 py-3 font-medium">Body</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {ads.map((ad) => {
              const statusColor =
                STATUS_COLORS[ad.effective_status] || 'bg-gray-500/20 text-gray-400';
              return (
                <tr key={ad.id} className="transition-colors hover:bg-gray-700/20">
                  <td className="px-6 py-3">
                    {ad.creative?.thumbnail_url ? (
                      <img
                        src={ad.creative.thumbnail_url}
                        alt={ad.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 text-xs text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-medium text-gray-200">
                    {ad.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                      {ad.effective_status}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-gray-400">
                    {ad.creative?.title || '—'}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-500">
                    {ad.creative?.body || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {new Date(ad.created_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
