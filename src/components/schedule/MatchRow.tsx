'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FullMatch, ScheduleMarket, ScheduleOutcome } from '@/lib/api';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props { match: FullMatch }

export default function MatchRow({ match }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeMarket, setActiveMarket] = useState('1x2');
  const { addSelection, removeSelection, selections } = useAccumStore();
  const { format } = useOddsStore();

  const primary = match.markets.find(m => m.type === '1x2') ?? match.markets[0];
  const selectedId = selections.find(s => s.matchId === match.id)?.outcomeId;

  const kickoff = new Date(match.kickoff).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  function pick(outcome: ScheduleOutcome, market: ScheduleMarket) {
    const already = selections.find(s => s.matchId === match.id && s.outcomeId === outcome.id);
    if (already) { removeSelection(match.id, outcome.id); return; }
    const prev = selections.find(s => s.matchId === match.id);
    if (prev) removeSelection(match.id, prev.outcomeId);
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
    toast.success(`Added: ${match.homeTeam} vs ${match.awayTeam} — ${outcome.label}`, {
      duration: 1200,
      style: { background: '#00a651', color: '#fff', fontSize: '12px' },
    });
  }

  const currentMarket = expanded
    ? (match.markets.find(m => m.type === activeMarket) ?? primary)
    : primary;

  return (
    <div className="border-b border-sp-border">
      {/* ── Compact match row ───────────────────────────────────── */}
      <div className="match-row">

        {/* Time + live badge */}
        <div className="flex flex-col items-center justify-center w-10 flex-none">
          <span className="text-xs text-sp-muted font-mono">{kickoff}</span>
          <span className="text-2xs text-sp-muted">FT</span>
        </div>

        {/* Teams */}
        <div className="flex-1 min-w-0 px-2">
          <Link href={`/match/${match.id}`}
            className="hover:text-sp-green transition-colors block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-sp-text truncate">{match.homeTeam}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-medium text-sp-text truncate">{match.awayTeam}</span>
            </div>
          </Link>
        </div>

        {/* 1X2 odds — SportyBet style */}
        <div className="flex gap-1 flex-none items-center">
          {primary.outcomes.slice(0, 3).map(o => {
            const isSelected = selectedId === o.id;
            return (
              <button
                key={o.id}
                onClick={() => pick(o, primary)}
                aria-pressed={isSelected}
                className={cn('odds-btn', isSelected && 'odds-btn-selected')}
              >
                <span className="odds-btn-label">{o.label}</span>
                <span className="odds-btn-value">{formatOdds(o.oddsBps, format)}</span>
              </button>
            );
          })}
        </div>

        {/* More markets */}
        <button
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          className="ml-2 flex-none text-sp-muted hover:text-sp-green text-xs
                     border border-sp-border rounded px-1.5 py-1 hover:border-sp-green transition-colors"
        >
          {expanded ? '▲' : `+${match.markets.length - 1}`}
        </button>
      </div>

      {/* ── Expanded markets ─────────────────────────────────────── */}
      {expanded && (
        <div className="bg-gray-50 border-t border-sp-border animate-fade-in">
          {/* Market tabs */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-sp-border bg-white">
            {match.markets.map(mkt => (
              <button key={mkt.type}
                onClick={() => setActiveMarket(mkt.type)}
                className={cn('chip text-2xs py-1 px-2.5',
                  activeMarket === mkt.type ? 'chip-active' : 'chip-inactive')}>
                {mkt.label}
              </button>
            ))}
          </div>

          {/* Outcomes grid */}
          {(() => {
            const mkt = match.markets.find(m => m.type === activeMarket) ?? primary;
            const cols = mkt.outcomes.length <= 2 ? 2 : mkt.outcomes.length <= 3 ? 3 : mkt.outcomes.length <= 6 ? 3 : 4;
            return (
              <div className="grid gap-1.5 p-3"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {mkt.outcomes.map(o => {
                  const isSel = selectedId === o.id;
                  return (
                    <button key={o.id} onClick={() => pick(o, mkt)} aria-pressed={isSel}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded border text-sm transition-all',
                        isSel
                          ? 'bg-sp-green border-sp-green text-white font-bold'
                          : 'bg-white border-sp-border text-sp-text hover:border-sp-green hover:bg-sp-green3'
                      )}>
                      <span className="text-sp-muted text-xs truncate mr-2"
                        style={isSel ? { color: 'rgba(255,255,255,0.8)' } : {}}>
                        {o.label}
                      </span>
                      <span className={cn('font-bold tabular-nums', isSel ? 'text-white' : 'text-sp-odds')}>
                        {formatOdds(o.oddsBps, format)}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
