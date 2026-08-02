'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds, impliedProbability } from '@/lib/odds';
import { FullMatch, ScheduleMarket, ScheduleOutcome } from '@/lib/api';
import AccumSlip from '@/components/schedule/AccumSlip';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const MARKET_ORDER = ['1x2', 'double_chance', 'btts', 'over_under', 'ht_ft', 'correct_score'];

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { format } = useOddsStore();
  const { addSelection, removeSelection, hasSelection, selections } = useAccumStore();

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/schedule/match/${id}`);
      const json = await res.json() as { success: boolean; data: FullMatch };
      return json.data;
    },
  });

  function handleSelect(market: ScheduleMarket, outcome: ScheduleOutcome) {
    if (!match) return;
    const already = hasSelection(match.id, outcome.id);
    if (already) {
      removeSelection(match.id, outcome.id);
      return;
    }
    const sameMatch = selections.find(s => s.matchId === match.id);
    if (sameMatch) removeSelection(match.id, sameMatch.outcomeId);
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

  const selectedOutcomeId = match
    ? selections.find(s => s.matchId === match.id)?.outcomeId
    : undefined;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
        <p className="text-gray-400 mb-4">Match not found.</p>
        <Link href="/sports" className="text-accent hover:underline">← Back to Sports</Link>
      </div>
    );
  }

  const kickoff = new Date(match.kickoff);
  const sortedMarkets = [...match.markets].sort(
    (a, b) => MARKET_ORDER.indexOf(a.type) - MARKET_ORDER.indexOf(b.type)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link href="/sports" className="hover:text-accent transition-colors">Sports</Link>
        <span aria-hidden="true">›</span>
        <span>{match.competition}</span>
        <span aria-hidden="true">›</span>
        <span className="text-white">{match.homeTeam} vs {match.awayTeam}</span>
      </nav>

      <div className="flex gap-5">
        <div className="flex-1 min-w-0 space-y-4">

          {/* Match header card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl" aria-hidden="true">{match.competitionIcon}</span>
              <span className="text-sm text-gray-400">{match.competition}</span>
              <span className="text-gray-600">·</span>
              <time dateTime={match.kickoff} className="text-sm text-gray-400">
                {kickoff.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' at '}
                {kickoff.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </time>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-around py-4">
              <div className="text-center flex-1">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-2" aria-hidden="true">
                  {match.homeTeam.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-white font-bold text-sm">{match.homeTeam}</p>
                <p className="text-gray-500 text-xs mt-0.5">Home</p>
              </div>

              <div className="text-center px-6">
                <p className="text-gray-600 text-2xl font-black">VS</p>
                <p className="text-gray-600 text-xs mt-1">
                  {kickoff.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-2" aria-hidden="true">
                  {match.awayTeam.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-white font-bold text-sm">{match.awayTeam}</p>
                <p className="text-gray-500 text-xs mt-0.5">Away</p>
              </div>
            </div>

            {/* Market count */}
            <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
              <span className="text-xs text-gray-500">{match.markets.length} markets available</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{match.markets.reduce((n, m) => n + m.outcomes.length, 0)} selections</span>
            </div>
          </Card>

          {/* All markets */}
          {sortedMarkets.map(market => {
            const cols =
              market.outcomes.length <= 2 ? 2 :
              market.outcomes.length <= 3 ? 3 :
              market.outcomes.length <= 6 ? 3 : 4;

            return (
              <Card key={market.type} className="overflow-hidden">
                {/* Market header */}
                <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5">
                  <h2 className="text-white font-semibold text-sm">{market.label}</h2>
                </div>

                {/* Outcome grid */}
                <div
                  className="grid gap-2 p-4"
                  style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                  role="group"
                  aria-label={`${market.label} outcomes`}
                >
                  {market.outcomes.map(outcome => {
                    const isSelected = selectedOutcomeId === outcome.id;
                    return (
                      <button
                        key={outcome.id}
                        onClick={() => handleSelect(market, outcome)}
                        aria-pressed={isSelected}
                        aria-label={`${outcome.label}: ${formatOdds(outcome.oddsBps, format)}`}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                          isSelected
                            ? 'bg-accent text-brand-900 border-accent font-bold'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-accent/30'
                        )}
                      >
                        <div className="text-left min-w-0">
                          <p className="font-medium truncate">{outcome.label}</p>
                          <p className={cn('text-xs mt-0.5', isSelected ? 'text-brand-700' : 'text-gray-500')}>
                            {impliedProbability(outcome.oddsBps)}
                          </p>
                        </div>
                        <span className="font-bold tabular-nums ml-3 flex-none text-base">
                          {formatOdds(outcome.oddsBps, format)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bet slip sidebar */}
        <aside className="hidden lg:block w-80 flex-none" aria-label="Bet slip">
          <div className="sticky top-20 space-y-3">
            {selections.length > 0 ? (
              <AccumSlip />
            ) : (
              <Card className="p-6 text-center">
                <p className="text-3xl mb-2" aria-hidden="true">🎯</p>
                <p className="text-white font-semibold text-sm mb-1">Bet Slip</p>
                <p className="text-gray-500 text-xs">
                  Click any odds button to add a selection
                </p>
              </Card>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile bet slip */}
      {selections.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 z-40 bg-brand-900/95 backdrop-blur-xl border-t border-white/10">
          <AccumSlip />
        </div>
      )}
    </div>
  );
}
