'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { applyEdge, plinkoBucketFromFloat } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useProvablyFair } from '@/hooks/useProvablyFair';
import toast from 'react-hot-toast';

const BUCKETS: Record<string, number[]> = {
  low:    [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
  medium: [13,  3,   1.3, 0.7, 0.4, 0.7, 1.3, 3,   13  ],
  high:   [29,  4,   1.5, 0.3, 0.2, 0.3, 1.5, 4,   29  ],
};

const BUCKET_COLORS = [
  '#8b5cf6','#6366f1','#3b82f6','#22c55e','#f59e0b','#22c55e','#3b82f6','#6366f1','#8b5cf6',
];

const rows = 8;

export default function PlinkoPage() {
  const { isConnected, connect } = useWalletStore();
  const pf = useProvablyFair('plinko');

  const [stakeXlm, setStakeXlm] = useState(10);
  const [risk, setRisk] = useState<'low'|'medium'|'high'>('medium');
  const [dropping, setDropping] = useState(false);
  const [ballPos, setBallPos] = useState<number | null>(null);
  const [landedBucket, setLandedBucket] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [history, setHistory] = useState<{bucket: number; mult: number}[]>([]);

  const buckets = BUCKETS[risk];

  async function dropBall() {
    if (!isConnected) { connect(); return; }
    setDropping(true);
    setLandedBucket(null);
    setWon(null);
    setBallPos(4);

    try {
      await pf.commit();

      // Animate visual path (cosmetic only — uses Math.random for ball animation)
      let pos = 4;
      for (let i = 0; i < rows; i++) {
        await new Promise(r => setTimeout(r, 120));
        pos += Math.random() < 0.5 ? -0.5 : 0.5;
        setBallPos(pos);
      }

      // Provably fair result
      const floats = await pf.reveal(1);
      const finalBucket = plinkoBucketFromFloat(floats[0]);
      const mult = applyEdge(buckets[finalBucket]);

      setLandedBucket(finalBucket);
      setMultiplier(mult);
      setBallPos(finalBucket);
      const didWin = mult > 1;
      setWon(didWin);
      setHistory(h => [{ bucket: finalBucket, mult }, ...h].slice(0, 8));

      if (didWin) toast.success(`Landed on ${mult.toFixed(2)}x — Won ${formatXlm(stakeXlm * mult)}!`, { icon: '🎯' });
      else toast.error(`Landed on ${mult.toFixed(2)}x — Lost`);
    } catch {
      toast.error('Could not reach server — try again');
    } finally {
      setDropping(false);
    }
  }

  const canvas = (
    <Card className="p-4">
      <div className="relative bg-brand-900 rounded-2xl border border-white/5 overflow-hidden mb-4"
        style={{ minHeight: 280 }} aria-label="Plinko board">
        <svg width="100%" height="280" viewBox="0 0 320 280" aria-hidden="true">
          {Array.from({ length: rows }).map((_, row) =>
            Array.from({ length: row + 2 }).map((_, col) => {
              const x = 160 - ((row + 1) * 18) + col * 36;
              const y = 30 + row * 28;
              return <circle key={`${row}-${col}`} cx={x} cy={y} r={5} fill="rgba(255,255,255,0.15)" />;
            })
          )}
          {ballPos !== null && (
            <circle cx={160 + (ballPos - 4) * 36} cy={dropping ? 240 : 10} r={10} fill="#3ecf8e"
              style={{ transition: 'all 0.12s ease' }} />
          )}
          {Array.from({ length: 10 }).map((_, i) => {
            const x = 16 + i * 32;
            return <line key={i} x1={x} y1={250} x2={x} y2={270} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />;
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex">
          {buckets.map((mult, i) => (
            <div key={i}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-b-lg transition-all ${landedBucket === i ? 'scale-110 brightness-150' : ''}`}
              style={{ backgroundColor: BUCKET_COLORS[i] + '40', color: BUCKET_COLORS[i] }}>
              {mult}x
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3" aria-label="Recent results">
          {history.map((h, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-bold ${h.mult > 1 ? 'bg-win/20 text-win' : 'bg-red-500/20 text-red-400'}`}>
              {h.mult.toFixed(2)}x
            </span>
          ))}
        </div>
      )}

      <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={multiplier} />

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
      <h2 className="text-white font-semibold">Plinko</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} disabled={dropping} />

      <div>
        <p className="text-xs text-gray-400 mb-2">Risk Level</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Risk level">
          {(['low','medium','high'] as const).map(r => (
            <button key={r} onClick={() => setRisk(r)} aria-pressed={risk === r}
              className={`py-2 rounded-xl text-xs font-semibold border capitalize transition-all
                ${risk === r ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
              {r}
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

      <Button variant="primary" size="lg" className="w-full" loading={dropping} onClick={dropBall}>
        {isConnected ? '🔵 Drop Ball' : 'Connect Wallet'}
      </Button>
      <p className="text-center text-xs text-gray-600">5% house edge · Provably fair · Testnet</p>
    </Card>
  );

  return <GameLayout title="Plinko" icon="🔵" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
