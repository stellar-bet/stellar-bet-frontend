'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { FullMatch, ScheduleMarket, ScheduleOutcome } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function FeaturedBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-matches'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/schedule/featured`);
      const json = await res.json() as { success: boolean; data: FullMatch[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });

  const { addSelection, hasSelection, selections } = useAccumStore();
  const { format } = useOddsStore();

  function handleSelect(match: FullMatch, market: ScheduleMarket, outcome: ScheduleOutcome) {
    const already = hasSelection(match.id, outcome.id);
    if (already) return;
    const sameMatch = selections.find(s => s.matchId === match.id);
    if (sameMatch) return;
    addSelection({
      matchId: match.id,
      matchDesc: `${match.homeTeam} vs ${match.awayTeam}`,
      competition: match.competition,
      marketType: market.type,
      marketLabel: market.label,
      outcomeId: outcome.id,
      outcomeLabel: outcome.label,
      oddsBps: outcome.oddsBps,
    });
    toast.success(`${outcome.label} added`, { duration: 1500, icon: '✅' });
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  const featured = (data ?? []).slice(0, 6);
  if (featured.length === 0) return null;

  return (
    <section aria-label="Featured matches" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
          Featured Today
        </h2>
        <Link href="/sports" className="text-xs text-accent hover:underline">
          View all {'>'}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map(match => {
          const market = match.markets.find(m => m.type === '1x2') ?? match.markets[0];
          const kickoffTime = new Date(match.kickoff).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: false,
          });

          return (
            <div key={match.id}
              className="bg-card-gradient border border-white/5 rounded-2xl p-3
                         hover:border-accent/20 transition-all duration-200">
              {/* Match header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" aria-hidden="true">{match.competitionIcon}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{match.competition}</span>
                </div>
                <span className="text-xs text-gray-600">{kickoffTime}</span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-white text-sm font-semibold truncate flex-1">{match.homeTeam}</p>
                <span className="text-gray-600 text-xs mx-2">vs</span>
                <p className="text-white text-sm font-semibold truncate flex-1 text-right">{match.awayTeam}</p>
              </div>

              {/* 1X2 odds buttons */}
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${Math.min(market.outcomes.length, 3)}, 1fr)` }}
                role="group"
                aria-label={`Odds for ${match.homeTeam} vs ${match.awayTeam}`}
              >
                {market.outcomes.slice(0, 3).map(outcome => {
                  const isSelected = hasSelection(match.id, outcome.id);
                  return (
                    <button
                      key={outcome.id}
                      onClick={() => handleSelect(match, market, outcome)}
                      aria-pressed={isSelected}
                      aria-label={`${outcome.label}: ${formatOdds(outcome.oddsBps, format)}`}
                      className={`flex flex-col items-center py-2 rounded-xl border text-xs transition-all
                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent
                        ${isSelected
                          ? 'bg-accent text-brand-900 border-accent font-bold'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-accent/30'}`}
                    >
                      <span className="text-[10px] text-gray-500 mb-0.5">{outcome.label}</span>
                      <span className="font-bold tabular-nums">{formatOdds(outcome.oddsBps, format)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
