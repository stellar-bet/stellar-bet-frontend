'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FullMatch } from '@/lib/api';
import CompetitionGroup from '@/components/schedule/CompetitionGroup';
import AccumSlip from '@/components/schedule/AccumSlip';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { OddsFormat, ODDS_FORMAT_LABELS } from '@/lib/odds';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const SPORT_TABS = [
  { key: 'all',              label: 'All',       icon: '🏟' },
  { key: 'premier_league',   label: 'EPL',        icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { key: 'champions_league', label: 'UCL',        icon: '🏆' },
  { key: 'europa_league',    label: 'UEL',        icon: '🟠' },
  { key: 'afcon',            label: 'AFCON',      icon: '🌍' },
  { key: 'la_liga',          label: 'La Liga',    icon: '🇪🇸' },
  { key: 'serie_a',          label: 'Serie A',    icon: '🇮🇹' },
  { key: 'bundesliga',       label: 'Bundesliga', icon: '🇩🇪' },
  { key: 'ligue_1',          label: 'Ligue 1',    icon: '🇫🇷' },
  { key: 'scottish_premiership', label: 'SPL',   icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { key: 'primeira_liga',    label: 'Portugal',   icon: '🇵🇹' },
  { key: 'nba',              label: 'NBA',        icon: '🏀' },
  { key: 'nfl',              label: 'NFL',        icon: '🏈' },
  { key: 'ufc',              label: 'UFC',        icon: '🥊' },
];

function slug(s: string) { return s.toLowerCase().replace(/\s+/g, '_'); }

export default function SportsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const { selections } = useAccumStore();
  const { format, setFormat } = useOddsStore();
  const searchParams = useSearchParams();
  const sportParam = searchParams.get('sport') ?? '';
  const qParam = searchParams.get('q') ?? '';

  const activeTab = sportParam || tab;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/schedule`);
      return res.json() as Promise<{
        success: boolean; data: FullMatch[];
        grouped: Record<string, FullMatch[]>; count: number;
      }>;
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!data?.data) return [];
    let list = data.data;
    if (activeTab !== 'all') {
      list = list.filter(m => slug(m.competition) === activeTab);
    }
    const q = (search || qParam).toLowerCase();
    if (q) {
      list = list.filter(m =>
        m.homeTeam.toLowerCase().includes(q) ||
        m.awayTeam.toLowerCase().includes(q) ||
        m.competition.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, activeTab, search, qParam]);

  const grouped = useMemo(() => {
    const g: Record<string, { matches: FullMatch[]; icon: string; country: string }> = {};
    for (const m of filtered) {
      if (!g[m.competition]) g[m.competition] = { matches: [], icon: m.competitionIcon, country: m.country };
      g[m.competition].matches.push(m);
    }
    return g;
  }, [filtered]);

  return (
    <div className="flex h-full">
      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Filter bar */}
        <div className="bg-white border-b border-sp-border px-3 py-2 flex items-center gap-2 shadow-sm">
          {/* Search */}
          <div className="relative hidden sm:block w-44">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-sp-border rounded pl-6 pr-2 py-1.5 text-sm
                         text-sp-text placeholder-gray-400 focus:outline-none focus:border-sp-green" />
          </div>

          {/* Sport tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none flex-1" role="tablist">
            {SPORT_TABS.map(t => (
              <button key={t.key} role="tab" aria-selected={activeTab === t.key}
                onClick={() => setTab(t.key)}
                className={cn('chip flex items-center gap-1 text-2xs py-1 px-2',
                  activeTab === t.key ? 'chip-active' : 'chip-inactive')}>
                <span aria-hidden="true">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Odds format */}
          <div className="hidden md:flex items-center border border-sp-border rounded overflow-hidden flex-none">
            {(['decimal', 'fractional', 'american'] as OddsFormat[]).map(f => (
              <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
                className={cn('px-2 py-1.5 text-xs font-bold transition-all',
                  format === f
                    ? 'bg-sp-green text-white'
                    : 'bg-white text-sp-muted hover:bg-gray-50')}>
                {f === 'decimal' ? 'Dec' : f === 'fractional' ? 'Frac' : 'US'}
              </button>
            ))}
          </div>

          <span className="text-xs text-sp-muted flex-none hidden sm:block">
            {filtered.length} matches
          </span>
        </div>

        {/* Match list */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-white rounded border border-sp-border animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sp-muted mb-3">Failed to load matches</p>
              <button onClick={() => refetch()}
                className="text-sp-green hover:underline text-sm font-semibold">Retry</button>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-5xl mb-3">🔍</span>
              <p className="text-sp-muted">No matches found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([comp, g]) => (
              <CompetitionGroup key={comp} competition={comp}
                icon={g.icon} country={g.country} matches={g.matches} defaultOpen />
            ))
          )}
        </div>
      </div>

      {/* ── Bet slip sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 border-l border-sp-border bg-sp-white flex-none shadow-md">
        <AccumSlip />
      </aside>

      {/* Mobile slip */}
      {selections.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 max-h-[72vh] overflow-y-auto
                        bg-white border-t-2 border-sp-green z-40 shadow-2xl animate-slide-up">
          <AccumSlip />
        </div>
      )}
    </div>
  );
}
