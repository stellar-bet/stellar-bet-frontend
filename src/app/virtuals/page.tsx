'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { virtualsApi, VirtualGame } from '@/lib/api';
import AccumSlip from '@/components/schedule/AccumSlip';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState as useCountdown, useEffect } from 'react';

const CATS = [
  { key:'all',              label:'All',          icon:'🎮' },
  { key:'virtual_football', label:'Football',     icon:'⚽' },
  { key:'virtual_basketball',label:'Basketball',  icon:'🏀' },
  { key:'virtual_horses',   label:'Horse Racing', icon:'🐎' },
  { key:'virtual_dogs',     label:'Greyhounds',   icon:'🐕' },
];

function Countdown({ secs }: { secs: number }) {
  const [t, setT] = useState(secs);
  useEffect(() => {
    if (t <= 0) return;
    const id = setInterval(() => setT(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [t]);
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  return <span className={cn('font-mono font-black tabular-nums', t <= 10 && 'text-sp-live')}>{mm}:{ss}</span>;
}

export default function VirtualsPage() {
  const [cat, setCat] = useState('all');
  const { selections, addSelection, removeSelection } = useAccumStore();
  const { format } = useOddsStore();

  const { data, isLoading } = useQuery({
    queryKey: ['virtuals'],
    queryFn: virtualsApi.all,
    refetchInterval: 10_000,
  });

  const games: VirtualGame[] = data
    ? cat === 'all' ? data : data.filter(g => g.category === cat)
    : [];

  function pick(game: VirtualGame, outcome: { name: string; oddsBps: number }, idx: number) {
    const oid = `virt_${idx}`;
    const prev = selections.find(s => s.matchId === game.id);
    if (prev?.outcomeId === oid) { removeSelection(game.id, oid); return; }
    if (prev) removeSelection(game.id, prev.outcomeId);
    addSelection({
      matchId: game.id, matchDesc: game.description,
      competition: game.categoryLabel, marketType: '1x2', marketLabel: 'Winner',
      outcomeId: oid, outcomeLabel: outcome.name, oddsBps: outcome.oddsBps,
    });
    toast.success(`${outcome.name} added`);
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <div className="section-header">
          ⚡ Virtual Sports
          <span className="ml-2 bg-white text-sp-green text-2xs font-black px-2 py-0.5 rounded-full">
            Every 3 mins
          </span>
        </div>

        {/* Category filter */}
        <div className="bg-white border-b border-sp-border px-3 py-2 flex gap-2 overflow-x-auto scrollbar-none" role="tablist">
          {CATS.map(c => (
            <button key={c.key} role="tab" aria-selected={cat===c.key}
              onClick={() => setCat(c.key)}
              className={cn('chip flex items-center gap-1', cat===c.key?'chip-active':'chip-inactive')}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Games grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} className="h-48 bg-white rounded border border-sp-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {games.map(game => {
                const selId = selections.find(s=>s.matchId===game.id)?.outcomeId;
                return (
                  <div key={game.id} className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-sp-green3 border-b border-sp-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{game.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-sp-text">{game.categoryLabel}</p>
                          <p className="text-xs text-sp-muted truncate max-w-[140px]">{game.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xs text-sp-muted">Starts in</p>
                        <Countdown secs={game.kickoffIn} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-gray-200">
                      <div className="h-full bg-sp-green transition-all"
                        style={{ width: `${Math.min(100, (1 - game.kickoffIn/game.duration)*100)}%` }} />
                    </div>

                    {/* Outcomes */}
                    <div className="p-3 space-y-1.5">
                      {game.outcomes.map((o, idx) => {
                        const oid = `virt_${idx}`;
                        const isSel = selId === oid;
                        return (
                          <button key={o.name} onClick={() => pick(game, o, idx)}
                            disabled={game.kickoffIn === 0}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 rounded border text-sm transition-all',
                              isSel ? 'bg-sp-green border-sp-green text-white font-bold' :
                              'bg-white border-sp-border text-sp-text hover:border-sp-green hover:bg-sp-green3',
                              game.kickoffIn===0 && 'opacity-40 cursor-not-allowed'
                            )}>
                            <span className={cn('text-xs truncate mr-2', isSel?'text-white/80':'text-sp-muted')}>{o.name}</span>
                            <span className={cn('font-bold tabular-nums', isSel?'text-white':'text-sp-odds')}>
                              {formatOdds(o.oddsBps, format)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {game.kickoffIn === 0 && (
                      <div className="px-3 pb-2 text-center text-xs font-bold text-sp-yellow animate-pulse">
                        🏁 Starting now...
                      </div>
                    )}
                  </div>
                );
              })}
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
