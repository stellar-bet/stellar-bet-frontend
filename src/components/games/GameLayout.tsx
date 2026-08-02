'use client';

import { ReactNode } from 'react';
import { formatXlm } from '@/lib/utils';

interface GameLayoutProps {
  title: string;
  icon: string;
  children: ReactNode;
  /** Left panel — game canvas */
  canvas: ReactNode;
  /** Right panel — bet controls */
  controls: ReactNode;
}

export default function GameLayout({ title, icon, canvas, controls }: GameLayoutProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl" aria-hidden="true">{icon}</span>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
          Testnet Demo
        </span>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">{canvas}</div>
        <div>{controls}</div>
      </div>
    </div>
  );
}

/** Reusable stake control block */
interface StakeControlProps {
  stakeXlm: number;
  setStake: (v: number) => void;
  disabled?: boolean;
}

export function StakeControl({ stakeXlm, setStake, disabled }: StakeControlProps) {
  return (
    <div className="mb-4">
      <label htmlFor="game-stake" className="text-xs text-gray-400 block mb-1.5">
        Stake (XLM)
      </label>
      <input
        id="game-stake"
        type="number"
        min={1}
        value={stakeXlm}
        disabled={disabled}
        onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
        className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
        aria-label="Stake amount in XLM"
      />
      <div className="flex gap-1.5 mt-2">
        {[5, 10, 25, 50, 100].map((v) => (
          <button
            key={v}
            disabled={disabled}
            onClick={() => setStake(v)}
            className="flex-1 text-xs py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400
                       hover:text-white transition-colors disabled:opacity-40"
            aria-label={`Set stake to ${v} XLM`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Win/loss result banner */
interface ResultBannerProps {
  won: boolean | null;
  stakeXlm: number;
  multiplier: number;
}

export function ResultBanner({ won, stakeXlm, multiplier }: ResultBannerProps) {
  if (won === null) return null;
  const payout = stakeXlm * multiplier;
  return (
    <div className={`rounded-xl p-3 text-center font-semibold text-sm mt-3
      ${won ? 'bg-win/10 border border-win/30 text-win' : 'bg-loss/10 border border-loss/30 text-loss'}`}
      role="status"
      aria-live="polite"
    >
      {won
        ? `🎉 You won ${formatXlm(payout)} (${multiplier.toFixed(2)}x)`
        : `💸 You lost ${formatXlm(stakeXlm)}`}
    </div>
  );
}
