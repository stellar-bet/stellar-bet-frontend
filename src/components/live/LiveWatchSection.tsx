'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { liveApi, LiveMatch } from '@/lib/api';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LiveWatchSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['live-watch'],
    queryFn: liveApi.all,
    refetchInterval: 15_000,
  });

  const live = data?.filter(m => m.status === 'LIVE' || m.status === 'HT') ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Set first match once data loads
  useEffect(() => {
    if (live.length > 0 && selectedId === null) {
      setSelectedId(live[0].id);
    }
  }, [live.length]);

  const { addSelection, removeSelection, selections } = useAccumStore();
  const { format } = useOddsStore();

  const watching = live.find(m => m.id === selectedId) ?? live[0] ?? null;

  function pick(match: LiveMatch, outcomeName: string, oddsBps: number, idx: number) {
    const oid = `live_${idx}`;
    const prev = selections.find(s => s.matchId === match.id);
    if (prev?.outcomeId === oid) { removeSelection(match.id, oid); return; }
    if (prev) removeSelection(match.id, prev.outcomeId);
    addSelection({
      matchId: match.id, matchDesc: `${match.homeTeam} vs ${match.awayTeam}`,
      competition: match.sport, marketType: '1x2', marketLabel: 'Match Result',
      outcomeId: oid, outcomeLabel: outcomeName, oddsBps,
    });
    toast.success(`${outcomeName} added to slip`);
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className="mt-2 mx-2">
        <div className="section-header rounded-t">
          <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" />
          Watch &amp; Bet Live
        </div>
        <div className="border border-sp-border border-t-0 rounded-b bg-white p-4">
          <div className="animate-pulse flex gap-3">
            <div className="bg-gray-200 rounded flex-1 h-56" />
            <div className="w-56 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded h-14" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Always show section — use mock matches if none are live
  const displayMatches = live.length > 0 ? live : [];
  const displayWatch = watching;

  if (displayMatches.length === 0) return null;

  return (
    <section className="mt-2 mx-2">
      {/* Header */}
      <div className="section-header rounded-t">
        <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" aria-hidden="true" />
        Watch &amp; Bet Live
        <span className="ml-2 bg-white text-sp-live text-2xs font-black px-2 py-0.5 rounded-full">
          {displayMatches.length} live
        </span>
        <a href="/live" className="ml-auto text-white/80 hover:text-white text-xs font-medium">
          All live →
        </a>
      </div>

      <div className="border border-sp-border border-t-0 rounded-b overflow-hidden bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row">

          {/* ── Left: Stream + scoreboard ───────────────────────────── */}
          {displayWatch && (
            <div className="flex-1 min-w-0">

              {/* Stream player */}
              <div className="relative overflow-hidden bg-gray-900"
                style={{ aspectRatio: '16/9', minHeight: 220 }}>

                {/* Pitch background */}
                <div className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at 50% 50%, #2d6a23 0%, #1a4a15 40%, #0d2e0a 100%)' }} />

                {/* Pitch markings SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450" aria-hidden="true"
                  style={{ opacity: 0.25 }}>
                  {/* Outer boundary */}
                  <rect x="40" y="30" width="720" height="390" fill="none" stroke="#fff" strokeWidth="2" />
                  {/* Centre line */}
                  <line x1="400" y1="30" x2="400" y2="420" stroke="#fff" strokeWidth="2" />
                  {/* Centre circle */}
                  <circle cx="400" cy="225" r="80" fill="none" stroke="#fff" strokeWidth="2" />
                  <circle cx="400" cy="225" r="4" fill="#fff" />
                  {/* Left penalty area */}
                  <rect x="40" y="130" width="120" height="190" fill="none" stroke="#fff" strokeWidth="2" />
                  {/* Left goal area */}
                  <rect x="40" y="175" width="50" height="100" fill="none" stroke="#fff" strokeWidth="2" />
                  {/* Right penalty area */}
                  <rect x="640" y="130" width="120" height="190" fill="none" stroke="#fff" strokeWidth="2" />
                  {/* Right goal area */}
                  <rect x="710" y="175" width="50" height="100" fill="none" stroke="#fff" strokeWidth="2" />
                  {/* Penalty spots */}
                  <circle cx="120" cy="225" r="4" fill="#fff" />
                  <circle cx="680" cy="225" r="4" fill="#fff" />
                  {/* Corner arcs */}
                  <path d="M40,30 Q55,30 55,45" fill="none" stroke="#fff" strokeWidth="2" />
                  <path d="M760,30 Q745,30 745,45" fill="none" stroke="#fff" strokeWidth="2" />
                  <path d="M40,420 Q55,420 55,405" fill="none" stroke="#fff" strokeWidth="2" />
                  <path d="M760,420 Q745,420 745,405" fill="none" stroke="#fff" strokeWidth="2" />
                </svg>

                {/* LIVE badge top-left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-sp-live px-2.5 py-1 rounded z-10">
                  <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" aria-hidden="true" />
                  <span className="text-white text-xs font-black tracking-widest">LIVE</span>
                </div>

                {/* Match clock top-right */}
                <div className="absolute top-3 right-3 bg-black/70 px-2.5 py-1 rounded z-10">
                  <span className="text-white font-black text-sm tabular-nums">
                    {displayWatch.status === 'HT' ? 'HT' : `${displayWatch.minute}'`}
                  </span>
                </div>

                {/* Central scoreboard */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-black/75 rounded-2xl px-6 py-4 text-center"
                    style={{ backdropFilter: 'blur(4px)' }}>
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      {displayWatch.sport}
                    </p>
                    <div className="flex items-center gap-6">
                      {/* Home */}
                      <div className="text-center w-28">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20
                                        flex items-center justify-center text-2xl mx-auto mb-1">
                          {displayWatch.sportIcon}
                        </div>
                        <p className="text-white font-bold text-sm leading-tight">
                          {displayWatch.homeTeam}
                        </p>
                      </div>
                      {/* Score */}
                      <div className="text-center">
                        <div className="flex items-center gap-3">
                          <span className="text-5xl font-black text-white tabular-nums">
                            {displayWatch.homeScore}
                          </span>
                          <span className="text-3xl text-gray-500 font-bold">–</span>
                          <span className="text-5xl font-black text-white tabular-nums">
                            {displayWatch.awayScore}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{displayWatch.period}</p>
                      </div>
                      {/* Away */}
                      <div className="text-center w-28">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20
                                        flex items-center justify-center text-2xl mx-auto mb-1">
                          {displayWatch.sportIcon}
                        </div>
                        <p className="text-white font-bold text-sm leading-tight">
                          {displayWatch.awayTeam}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream note bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent
                                 py-2 px-3 z-10 flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    🔴 Live · {displayWatch.homeTeam} vs {displayWatch.awayTeam}
                  </span>
                  <a href="/register"
                    className="text-xs bg-sp-green text-white px-3 py-1 rounded font-bold
                               hover:bg-green-700 transition-colors">
                    Login to Watch
                  </a>
                </div>
              </div>

              {/* In-play odds bar below video */}
              <div className="bg-gray-50 border-t border-sp-border px-3 py-2.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-sp-text">
                    In-Play Betting — Match Result
                  </p>
                  <a href={`/match/${displayWatch.id}`}
                    className="text-xs text-sp-green hover:underline font-semibold">
                    All markets →
                  </a>
                </div>
                <div className="flex gap-2"
                  style={{ gridTemplateColumns: `repeat(${displayWatch.outcomes.length}, 1fr)` }}>
                  {displayWatch.outcomes.map((o, idx) => {
                    const oid = `live_${idx}`;
                    const isSel = !!selections.find(s => s.matchId === displayWatch.id && s.outcomeId === oid);
                    return (
                      <button key={o.name} onClick={() => pick(displayWatch, o.name, o.oddsBps, idx)}
                        aria-pressed={isSel}
                        className={cn('odds-btn flex-1', isSel && 'odds-btn-selected')}>
                        <span className="odds-btn-label">{o.name}</span>
                        <span className="odds-btn-value">{formatOdds(o.oddsBps, format)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stats */}
                {displayWatch.stats?.homePossession !== undefined && (
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'Possession', home: displayWatch.stats.homePossession!, away: displayWatch.stats.awayPossession!, pct: true },
                      { label: 'Shots', home: displayWatch.stats.homeShots!, away: displayWatch.stats.awayShots!, pct: false },
                      { label: 'Corners', home: displayWatch.stats.homeCorners!, away: displayWatch.stats.awayCorners!, pct: false },
                    ].filter(s => s.home !== undefined).map(stat => (
                      <div key={stat.label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-bold text-sp-text w-8">{stat.home}{stat.pct ? '%' : ''}</span>
                          <span className="text-sp-muted text-center flex-1">{stat.label}</span>
                          <span className="font-bold text-sp-text w-8 text-right">{stat.away}{stat.pct ? '%' : ''}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                          <div className="h-full bg-sp-green transition-all duration-500"
                            style={{ width: stat.pct
                              ? `${stat.home}%`
                              : `${(stat.home / Math.max(stat.home + stat.away, 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Right: Live match list ───────────────────────────── */}
          <div className="w-full lg:w-60 flex-none border-t lg:border-t-0 lg:border-l border-sp-border">
            <div className="px-3 py-2 bg-gray-50 border-b border-sp-border">
              <p className="text-xs font-bold text-sp-text uppercase tracking-wide">
                Live Events
              </p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
              {displayMatches.map(m => (
                <button key={m.id} onClick={() => setSelectedId(m.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 border-b border-sp-border transition-all',
                    m.id === (selectedId ?? displayMatches[0]?.id)
                      ? 'bg-sp-green3'
                      : 'bg-white hover:bg-gray-50'
                  )}
                  style={m.id === (selectedId ?? displayMatches[0]?.id)
                    ? { borderLeft: '3px solid #00a651' }
                    : { borderLeft: '3px solid transparent' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xs text-sp-muted">
                      {m.sportIcon} {m.sport}
                    </span>
                    <span className={cn(
                      'text-2xs font-black px-1.5 py-0.5 rounded',
                      m.status === 'HT'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-red-100 text-sp-live'
                    )}>
                      {m.status === 'HT' ? 'HT' : `${m.minute}'`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-sp-text truncate">{m.homeTeam}</p>
                      <p className="text-xs font-semibold text-sp-text truncate mt-0.5">{m.awayTeam}</p>
                    </div>
                    <div className="ml-2 text-right flex-none">
                      <p className="text-lg font-black text-sp-text tabular-nums leading-tight">{m.homeScore}</p>
                      <p className="text-lg font-black text-sp-text tabular-nums leading-tight">{m.awayScore}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
