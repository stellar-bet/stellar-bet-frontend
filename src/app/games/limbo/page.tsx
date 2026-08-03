'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { applyEdge, limboResultFromFloat } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useProvablyFair } from '@/hooks/useProvablyFair';
import toast from 'react-hot-toast';

export default function LimboPage() {
  const { isConnected, connect } = useWalletStore();
  const pf = useProvablyFair('limbo');

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

    try {
      await pf.commit();

      // Spin animation while commitment is pending
      let display = 1.0;
      const tick = setInterval(() => {
        display = Math.round((1 + Math.random() * 50) * 100) / 100;
        setResult(display);
      }, 60);
      await new Promise(r => setTimeout(r, 700));
      clearInterval(tick);

      const floats = await pf.reveal(1);
      const crashPoint = limboResultFromFloat(floats[0]);
      const didWin = crashPoint >= target;

      setResult(crashPoint);
      setWon(didWin);
      setHistory(h => [crashPoint, ...h].slice(0, 12));

      if (didWin) toast.success(`${crashPoint.toFixed(2)}x — Won ${formatXlm(stakeXlm * target)}!`, { icon: '🚀' });
      else toast.error(`${crashPoint.toFixed(2)}x — Didn't reach ${target.toFixed(2)}x`);
    } catch {
      toast.error('Could not reach server — try again');
    } finally {
      setSpinning(false);
    }
  }

  const resultColor = won === null ? 'text-white' : won ? 'text-win' : 'text-red-400';

  const canvas = (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center mb-8" style={{ minHeight: 200 }}>
        <div className={`text-6xl mb-4 transition-all duration-300 ${spinning ? 'animate-bounce' : ''}`} aria-hidden="true">
          {won === true ? '🚀' : won === false ? '💥' : spinning ? '🚀' : '🛸'}
        </div>
        <p className={`text-7xl font-black tabular-nums transition-all ${resultColor}`}
          aria-live="polite" aria-label={result ? `Result: ${result.toFixed(2)}x` : 'Waiting'}>
          {result ? `${result.toFixed(2)}x` : '—'}
        </p>
        {won !== null && (
          <p className={`text-sm mt-2 font-semibold ${won ? 'text-win' : 'text-red-400'}`}>
            {won ? `Target ${target.toFixed(2)}x reached!` : `Below target ${target.toFixed(2)}x`}
          </p>
        )}
      </div>

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

      {pf.lastReveal && (
        <details className="mt-4 text-xs text-gray-500 bg-white/5 rounded-xl p-3">
          <summary className="cursor-pointer text-accent font-medium">🔐 Provably Fair — verify last round</summary>
          <div className="mt-2 space-y-1 break-all">
            <p><span className="text-gray-400">Server seed:</span> {pf.lastReveal.serverSeed}</p>
            <p><span className="text-gray-400">Hash:</span> {pf.lastReveal.serverSeedHash}</p>
            <p><span className="text-gray-400">Client seed:</span> {pf.lastReveal.clientSeed}</p>
            <p><span className="text-gray-400">Nonce:</span> {pf.lastReveal.nonce}</p>
            <p><span className="text-gray-400">Result bytes:</span> {pf.lastReveal.resultBytes}</p>
          </div>
        </details>
      )}
    </Card>
  );

  const controls = (
    <Card className="p-4 space-y-4">
      <h2 className="text-white font-semibold">Limbo</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} />

      <div>
        <label htmlFor="limbo-target" className="text-xs text-gray-400 block mb-1.5">Target Multiplier</label>
        <input id="limbo-target" type="number" min={1.01} step={0.1} value={targetMult}
          onChange={(e) => setTargetMult(e.target.value)}
          className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent/50"
          aria-label="Target multiplier" />
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {[1.5, 2, 3, 5, 10, 50].map(v => (
            <button key={v} onClick={() => setTargetMult(String(v))}
              className="px-2 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              {v}x
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Your client seed</label>
        <input type="text" value={pf.clientSeed} onChange={(e) => pf.setClientSeed(e.target.value)}
          maxLength={128}
          className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white
                     focus:outline-none focus:ring-1 focus:ring-accent/50 font-mono"
          aria-label="Client seed" />
      </div>

      {pf.serverSeedHash && (
        <div className="bg-white/5 rounded-xl p-2 text-xs break-all">
          <p className="text-gray-400 font-medium mb-0.5">Server seed commitment</p>
          <p className="text-accent font-mono">{pf.serverSeedHash}</p>
        </div>
      )}

      <Button variant="primary" size="lg" className="w-full" loading={spinning} onClick={play}>
        {isConnected ? '🚀 Launch' : 'Connect Wallet'}
      </Button>
      <p className="text-center text-xs text-gray-600">5% house edge · Provably fair · Testnet</p>
    </Card>
  );

  return <GameLayout title="Limbo" icon="🚀" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
