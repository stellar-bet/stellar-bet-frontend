'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { KENO_MULTIPLIERS, shuffle } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import toast from 'react-hot-toast';

const GRID = Array.from({ length: 40 }, (_, i) => i + 1);
const MAX_PICKS = 10;

export default function KenoPage() {
  const { isConnected, connect } = useWalletStore();
  const [stakeXlm, setStakeXlm] = useState(10);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [hits, setHits] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'over'>('idle');
  const [won, setWon] = useState<boolean | null>(null);
  const [multiplier, setMultiplier] = useState(0);

  function togglePick(n: number) {
    if (phase !== 'idle') return;
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(n)) { next.delete(n); return next; }
      if (next.size >= MAX_PICKS) { toast.error(`Max ${MAX_PICKS} picks`); return prev; }
      next.add(n);
      return next;
    });
  }

  async function play() {
    if (!isConnected) { connect(); return; }
    if (picked.size === 0) { toast.error('Pick at least 1 number'); return; }
    setPhase('drawing');
    setDrawn(new Set());
    setHits(new Set());

    // Draw 20 numbers one by one
    const drawnNums = shuffle([...GRID]).slice(0, 20);
    const drawnSet = new Set<number>();
    const hitSet = new Set<number>();

    for (const n of drawnNums) {
      await new Promise(r => setTimeout(r, 120));
      drawnSet.add(n);
      if (picked.has(n)) hitSet.add(n);
      setDrawn(new Set(drawnSet));
      setHits(new Set(hitSet));
    }

    const pickCount = picked.size;
    const hitCount = hitSet.size;
    const multTable = KENO_MULTIPLIERS[pickCount] ?? KENO_MULTIPLIERS[5];
    const mult = multTable[hitCount] ?? 0;
    const didWin = mult > 1;

    setMultiplier(mult);
    setWon(didWin);
    setPhase('over');

    if (didWin) toast.success(`${hitCount} hits! Won ${formatXlm(stakeXlm * mult)}`, { icon: '🎱' });
    else toast.error(`${hitCount} hits — better luck next time`);
  }

  function reset() {
    setPicked(new Set());
    setDrawn(new Set());
    setHits(new Set());
    setPhase('idle');
    setWon(null);
    setMultiplier(0);
  }

  const canvas = (
    <Card className="p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        {[
          { label: 'Selected', value: `${picked.size}/${MAX_PICKS}`, color: 'text-accent' },
          { label: 'Hits', value: hits.size, color: 'text-yellow-400' },
          { label: 'Drawn', value: drawn.size, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-2">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-8 gap-1.5 mb-4" role="grid" aria-label="Keno number grid">
        {GRID.map(n => {
          const isPicked = picked.has(n);
          const isDrawn = drawn.has(n);
          const isHit = hits.has(n);
          return (
            <button
              key={n}
              onClick={() => togglePick(n)}
              disabled={phase !== 'idle'}
              role="gridcell"
              aria-pressed={isPicked}
              aria-label={`Number ${n}${isPicked ? ' selected' : ''}${isHit ? ' hit' : ''}`}
              className={`aspect-square rounded-lg text-xs font-bold transition-all
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent
                ${isHit ? 'bg-yellow-400 text-brand-900 scale-110 shadow-lg shadow-yellow-400/30' :
                  isDrawn && !isPicked ? 'bg-white/10 text-gray-400' :
                  isPicked ? 'bg-accent text-brand-900 scale-105' :
                  'bg-white/5 text-gray-300 hover:bg-white/15 border border-white/5'}`}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Multiplier table */}
      {picked.size > 0 && picked.size <= 5 && (
        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Payout table ({picked.size} picks)</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(KENO_MULTIPLIERS[picked.size] ?? {}).map(([h, m]) => (
              <span key={h}
                className={`text-xs px-2 py-0.5 rounded-full font-bold
                  ${hits.size === Number(h) && phase === 'over' ? 'bg-yellow-400 text-brand-900' : 'bg-white/5 text-gray-300'}`}>
                {h} hit: {m}x
              </span>
            ))}
          </div>
        </div>
      )}

      <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={multiplier} />
    </Card>
  );

  const controls = (
    <Card className="p-4 space-y-4">
      <h2 className="text-white font-semibold">Keno</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} disabled={phase === 'drawing'} />

      {phase === 'idle' && (
        <>
          <Button variant="primary" size="lg" className="w-full"
            onClick={play} disabled={picked.size === 0}>
            {isConnected ? `🎱 Draw (${picked.size} picks)` : 'Connect Wallet'}
          </Button>
          {picked.size > 0 && (
            <Button variant="ghost" size="md" className="w-full" onClick={() => setPicked(new Set())}>
              Clear picks
            </Button>
          )}
        </>
      )}

      {phase === 'drawing' && (
        <div className="text-center py-3 text-accent animate-pulse font-semibold">
          Drawing numbers...
        </div>
      )}

      {phase === 'over' && (
        <Button variant="primary" size="lg" className="w-full" onClick={reset}>
          🔄 Play Again
        </Button>
      )}

      <p className="text-center text-xs text-gray-600">Pick 1–10 numbers · 20 drawn</p>
    </Card>
  );

  return <GameLayout title="Keno" icon="🎱" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
