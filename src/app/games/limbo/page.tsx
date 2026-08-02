'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { applyEdge } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import toast from 'react-hot-toast';

export default function LimboPage() {
  const { isConnected, connect } = useWalletStore();
  const [stakeXlm, setStakeXlm] = useState(10);
  const [targetMult, setTargetMult] = useState('2.00');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const target = Math.max(1.01, parseFloat(targetMult) || 2);
  const winChance = applyEdge(1 / target);
  const winPct = (winChance * 100).toFixed(2);

  async function play() {
    if (!isConnected) { connect(); return; }
    setSpinning(true);
    setResult(null);
    setWon(null);

    // Spin animation
    let display = 1.0;
    const tick = setInterval(() => {
      display = Math.round((1 + Math.random() * 50) * 100) / 100;
      setResult(display);
    }, 60);

    await new Promise(r => setTimeout(r, 700));
    clearInterval(tick);

    // Real result: win if random < winChance
    const didWin = Math.random() < winChance;
    let finalResult: number;
    if (didWin) {
      // Result between target and target*3
      finalResult = Math.round((target + Math.random() * target * 2) * 100) / 100;
    } else {
      // Result between 1.00 and target-0.01
      finalResult = Math.round((1 + Math.random() * (target - 1.01)) * 100) / 100;
    }

    setResult(finalResult);
    setWon(didWin);
    setHistory(h => [finalResult, ...h].slice(0, 12));
    setSpinning(false);

    if (didWin) toast.success(`${finalResult.toFixed(2)}x — Won ${formatXlm(stakeXlm * target)}!`, { icon: '🚀' });
    else toast.error(`${finalResult.toFixed(2)}x — Didn't reach ${target.toFixed(2)}x`);
  }

  const resultColor =
    won === null ? 'text-white' :
    won ? 'text-win' : 'text-red-400';

  const canvas = (
    <Card className="p-6">
      {/* Big result */}
      <div className="flex flex-col items-center justify-center mb-8" style={{ minHeight: 200 }}>
        {/* Rocket animation */}
        <div className={`text-6xl mb-4 transition-all duration-300 ${spinning ? 'animate-bounce' : ''}`}
          aria-hidden="true"
        >
          {won === true ? '🚀' : won === false ? '💥' : spinning ? '🚀' : '🛸'}
        </div>

        <p className={`text-7xl font-black tabular-nums transition-all ${resultColor}`}
          aria-live="polite"
          aria-label={result ? `Result: ${result.toFixed(2)}x` : 'Waiting'}
        >
          {result ? `${result.toFixed(2)}x` : '—'}
        </p>

        {won !== null && (
          <p className={`text-sm mt-2 font-semibold ${won ? 'text-win' : 'text-red-400'}`}>
            {won ? `Target ${target.toFixed(2)}x reached!` : `Below target ${target.toFixed(2)}x`}
          </p>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="flex gap-1.5 flex-wrap justify-center mb-4">
          {history.map((v, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold
              ${v >= target ? 'bg-win/20 text-win' : 'bg-red-500/20 text-red-400'}`}>
              {v.toFixed(2)}x
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        {[
          { label: 'Target', value: `${target.toFixed(2)}x`, color: 'text-accent' },
          { label: 'Win Chance', value: `${winPct}%`, color: 'text-yellow-400' },
          { label: 'Payout', value: formatXlm(stakeXlm * target), color: 'text-win' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={target} />
    </Card>
  );

  const controls = (
    <Card className="p-4 space-y-4">
      <h2 className="text-white font-semibold">Limbo</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} />

      <div>
        <label htmlFor="limbo-target" className="text-xs text-gray-400 block mb-1.5">
          Target Multiplier
        </label>
        <input
          id="limbo-target"
          type="number" min={1.01} step={0.1}
          value={targetMult}
          onChange={(e) => setTargetMult(e.target.value)}
          className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent/50"
          aria-label="Target multiplier"
        />
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {[1.5, 2, 3, 5, 10, 50].map(v => (
            <button key={v} onClick={() => setTargetMult(String(v))}
              className="px-2 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              {v}x
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" size="lg" className="w-full" loading={spinning} onClick={play}>
        {isConnected ? '🚀 Launch' : 'Connect Wallet'}
      </Button>
      <p className="text-center text-xs text-gray-600">5% house edge · Testnet only</p>
    </Card>
  );

  return <GameLayout title="Limbo" icon="🚀" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
