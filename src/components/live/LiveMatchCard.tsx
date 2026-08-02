'use client';

import { LiveMatch } from '@/lib/api';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props { match: LiveMatch }

export default function LiveMatchCard({ match }: Props) {
  const { addSelection, removeSelection, selections } = useAccumStore();
  const { format } = useOddsStore();
  const selectedId = selections.find(s => s.matchId === match.id)?.outcomeId;

  function pick(outcome: { name: string; oddsBps: number }, idx: number) {
    const oid = `live_${idx}`;
    if (selections.find(s => s.matchId === match.id && s.outcomeId === oid)) {
      removeSelection(match.id, oid); return;
    }
    const prev = selections.find(s => s.matchId === match.id);
    if (prev) removeSelection(match.id, prev.outcomeId);
    addSelection({
      matchId: match.id,
      matchDesc: `${match.homeTeam} vs ${match.awayTeam}`,
      competition: match.sport,
      marketType: '1x2',
      marketLabel: 'Match Result',
      outcomeId: oid,
      outcomeLabel: outcome.name,
      oddsBps: outcome.oddsBps,
    });
    toast.success(`Added: ${outcome.name}`, {
      style: { background: '#00a651', color: '#fff', fontSize: '12px' },
    });
  }

  const isHT = match.status === 'HT';

  return (
    <div className="p-2">
      {/* Competition + time */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xs text-sp-muted flex items-center gap-1">
          <span>{match.sportIcon}</span> {match.sport}
        </span>
        <span className={cn(
          'flex items-center gap-1 text-2xs font-bold px-1.5 py-0.5 rounded',
          isHT
            ? 'bg-orange-100 text-orange-600'
            : 'bg-red-100 text-sp-live'
        )}>
          {!isHT && <span className="w-1.5 h-1.5 rounded-full bg-sp-live animate-live-pulse" aria-hidden="true" />}
          {isHT ? 'HT' : `${match.minute}'`}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sp-text truncate">{match.homeTeam}</p>
          <p className="text-sm font-semibold text-sp-text truncate mt-0.5">{match.awayTeam}</p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          <span className="text-xl font-black text-sp-text tabular-nums leading-none">{match.homeScore}</span>
          <span className="text-xl font-black text-sp-text tabular-nums leading-none">{match.awayScore}</span>
        </div>
      </div>

      {/* Possession bar */}
      {match.stats?.homePossession !== undefined && (
        <div className="mb-2">
          <div className="flex justify-between text-2xs text-sp-faint mb-0.5">
            <span>{match.stats.homePossession}%</span>
            <span>Poss</span>
            <span>{match.stats.awayPossession}%</span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden flex">
            <div className="h-full bg-sp-green transition-all"
              style={{ width: `${match.stats.homePossession}%` }} />
          </div>
        </div>
      )}

      {/* Odds */}
      <div className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${match.outcomes.length}, 1fr)` }}>
        {match.outcomes.map((o, idx) => {
          const isSelected = selectedId === `live_${idx}`;
          return (
            <button key={o.name} onClick={() => pick(o, idx)}
              aria-pressed={isSelected}
              className={cn('odds-btn', isSelected && 'odds-btn-selected')}>
              <span className="odds-btn-label">{o.name}</span>
              <span className="odds-btn-value">{formatOdds(o.oddsBps, format)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
