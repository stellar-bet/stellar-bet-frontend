'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { liveApi, LiveMatch } from '@/lib/api';
import LiveMatchCard from '@/components/live/LiveMatchCard';
import AccumSlip from '@/components/schedule/AccumSlip';
import { useAccumStore } from '@/store/accumStore';
import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'all',                    label: 'All',       icon: '🔴' },
  { key: 'soccer_epl',             label: 'Football',  icon: '⚽' },
  { key: 'basketball_nba',         label: 'Basketball',icon: '🏀' },
  { key: 'tennis',                 label: 'Tennis',    icon: '🎾' },
  { key: 'mma_mixed_martial_arts', label: 'MMA',       icon: '🥊' },
];

export default function LivePage() {
  const [filter, setFilter] = useState('all');
  const { selections } = useAccumStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['live-matches'],
    queryFn: liveApi.all,
    refetchInterval: 12_000,
  });

  const matches: LiveMatch[] = data
    ? filter === 'all' ? data : data.filter(m => m.sport === filter)
    : [];
  const liveCount = data?.filter(m => m.status === 'LIVE').length ?? 0;

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <div className="section-header">
          <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" aria-hidden="true" />
          Live In-Play Betting
          <span className="bg-white text-sp-live text-2xs font-black px-2 py-0.5 rounded-full ml-2">
            {liveCount} live
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-sp-border px-3 py-2 flex gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn('chip flex items-center gap-1', f.key === filter ? 'chip-active' : 'chip-inactive')}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>

        {/* Matches */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded border border-sp-border animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-3">📺</span>
              <p className="text-sp-muted font-medium">No live matches right now</p>
              <button onClick={() => refetch()} className="text-sp-green text-sm mt-3 hover:underline font-semibold">
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {matches.map(m => (
                <div key={m.id} className="bg-white border border-sp-border rounded shadow-sm">
                  <LiveMatchCard match={m} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bet slip */}
      <aside className="hidden lg:flex flex-col w-72 border-l border-sp-border bg-white flex-none shadow-md">
        <AccumSlip />
      </aside>

      {selections.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 max-h-[72vh] overflow-y-auto
                        bg-white border-t-2 border-sp-green z-40 shadow-2xl animate-slide-up">
          <AccumSlip />
        </div>
      )}
    </div>
  );
}
