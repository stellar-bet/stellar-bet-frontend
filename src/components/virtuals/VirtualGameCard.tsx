'use client';

import { useState, useEffect } from 'react';
import { VirtualGame } from '@/lib/api';
import { bpsToOddsLabel } from '@/lib/utils';
import { useBetSlipStore } from '@/store/betSlipStore';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface Props { game: VirtualGame }

function useCountdown(initialSecs: number) {
  const [secs, setSecs] = useState(initialSecs);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secs]);
  return secs;
}

export default function VirtualGameCard({ game }: Props) {
  const countdown = useCountdown(game.kickoffIn);
  const addToBetSlip = useBetSlipStore((s) => s.addToBetSlip);
  const currentItem = useBetSlipStore((s) => s.item);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');
  const isAboutToStart = countdown <= 10;

  function selectOutcome(idx: number) {
    const outcome = game.outcomes[idx];
    if (!outcome) return;
    addToBetSlip({
      marketId: game.id,
      externalEventId: game.id,
      description: game.description,
      sport: game.category,
      outcomeName: outcome.name,
      outcomeIndex: idx,
      oddsBps: outcome.oddsBps,
      decimalOdds: outcome.avgDecimalOdds,
    });
    toast.success(`${outcome.name} added to slip`, { duration: 1500 });
  }

  return (
    <Card className="p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">{game.icon}</span>
          <div>
            <p className="text-xs text-gray-500">{game.categoryLabel}</p>
            <p className="text-white text-sm font-medium leading-tight">{game.description}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className={`text-right ${isAboutToStart ? 'text-red-400 animate-pulse' : 'text-accent'}`}>
          <p className="text-xs text-gray-500 mb-0.5">Starts in</p>
          <p className="font-mono font-bold text-lg tabular-nums">{mm}:{ss}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${isAboutToStart ? 'bg-red-400' : 'bg-accent'}`}
          style={{
            width: `${Math.max(0, 100 - (countdown / game.duration) * 100)}%`,
          }}
        />
      </div>

      {/* Outcome buttons */}
      <div
        className={`grid gap-2 ${game.outcomes.length <= 3 ? '' : 'grid-cols-2'}`}
        style={game.outcomes.length <= 3
          ? { gridTemplateColumns: `repeat(${game.outcomes.length}, 1fr)` }
          : undefined}
        role="group"
        aria-label={`Bet outcomes for ${game.description}`}
      >
        {game.outcomes.map((outcome, idx) => {
          const isSelected =
            currentItem?.marketId === game.id && currentItem.outcomeIndex === idx;
          return (
            <button
              key={outcome.name}
              onClick={() => selectOutcome(idx)}
              aria-pressed={isSelected}
              disabled={countdown === 0}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isSelected
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <span className="truncate mr-2 text-left">{outcome.name}</span>
              <span className="font-bold flex-none">{bpsToOddsLabel(outcome.oddsBps)}</span>
            </button>
          );
        })}
      </div>

      {countdown === 0 && (
        <p className="text-center text-xs text-yellow-400 mt-3 animate-pulse">
          🏁 Starting now...
        </p>
      )}
    </Card>
  );
}
