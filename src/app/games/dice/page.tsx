'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { applyEdge, diceResultFromFloat } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useProvablyFair } from '@/hooks/useProvablyFair';
import toast from 'react-hot-toast';

export default function DicePage() {
  const { isConnected, connect } = useWalletStore();
  const pf = useProvablyFair('dice');

  const [stakeXlm, setStakeXlm] = useState(10);
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState<'over' | 'under'>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);

  const winChance = mode === 'over' ? (100 - target) / 100 : target / 100;
  const multiplier = winChance > 0 ? applyEdge(1 / winChance) : 0;

  async function roll() {
    if (!isConnected) { connect(); return; }
    setRolling(true);
    setResult(null);
    setWon(null);

    try {
      // Step 1 — commit (get server seed hash)
      await pf.commit();

      // Brief animation while "locking in" the bet
      await new Promise(r => setTimeout(r, 500));

      // Step 2 — reveal (server seed unlocked, result derived)
      const floats = await pf.reveal(1);
      const rolled = diceResultFromFloat(floats[0]);
      const didWin = mode === 'over' ? rolled > target : rolled < target;

      setResult(rolled);
      setWon(didWin);

      if (didWin) {
        toast.success(`Rolled ${rolled} — Won ${formatXlm(stakeXlm * multiplier)}!`, { icon: '🎲' });
      } else {
        toast.error(`Rolled ${rolled} — Better luck next time`);
      }
    } catch {
      toast.error('Could not reach server — try again');
    } finally {
      setRolling(false);
    }
  }

  const canvas = (
    <Card className="p-6">
      {/* Big dice result display */}
      <div className="flex items-center justify-center mb-8" style={{ minHeight: 160 }}>
        <div className={`relative flex items-center justify-center w-36 h-36 rounded-3xl border-2 text-6xl font-black
          transition-all duration-300 shadow-2xl
          ${rolling ? 'animate-bounce border-accent/50 bg-accent/10' :
            won === true ? 'border-win bg-win/10 text-win' :
            won === false ? 'border-red-500 bg-red-500/10 text-red-400' :
            'border-white/10 bg-white/5 text-white'}`}
          aria-live="polite"
          aria-label={result ? `Rolled ${result}` : 'Dice result'}
        >
          {rolling ? '🎲' : result ?? '?'}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Target: <span className="text-white font-bold">{target}</span></span>
          <span className="text-gray-400">Win chance: <span className="text-accent font-bold">{(winChance * 100).toFixed(1)}%</span></span>
        </div>

        <div className="relative">
          <div className="h-3 rounded-full overflow-hidden flex mb-1">
            <div className="bg-win/40" style={{ width: `${mode === 'under' ? target : 100 - target}%` }} />
            <div className="bg-red-500/30 flex-1" />
          </div>
          <input
            type="range" min={2} max={98} value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full accent-accent"
            aria-label={`Target value: ${target}`}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1</span><span>100</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3" role="group" aria-label="Roll mode">
          {(['under','over'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                ${mode === m ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
              Roll {m === 'under' ? `Under ${target}` : `Over ${target}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        {[
          { label: 'Multiplier', value: `${multiplier.toFixed(2)}x`, color: 'text-accent' },
          { label: 'Win Chance', value: `${(winChance*100).toFixed(1)}%`, color: 'text-yellow-400' },
          { label: 'Payout', value: formatXlm(stakeXlm * multiplier), color: 'text-win' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={multiplier} />

      {/* Provably fair verification info */}
      {pf.lastReveal && (
        <details className="mt-4 text-xs text-gray-500 bg-white/5 rounded-xl p-3">
          <summary className="cursor-pointer text-accent font-medium">
            🔐 Provably Fair — verify last round
          </summary>
          <div className="mt-2 space-y-1 break-all">
            <p><span className="text-gray-400">Server seed:</span> {pf.lastReveal.serverSeed}</p>
            <p><span className="text-gray-400">Server seed hash:</span> {pf.lastReveal.serverSeedHash}</p>
            <p><span className="text-gray-400">Client seed:</span> {pf.lastReveal.clientSeed}</p>
            <p><span className="text-gray-400">Nonce:</span> {pf.lastReveal.nonce}</p>
            <p><span className="text-gray-400">Result bytes:</span> {pf.lastReveal.resultBytes}</p>
            <p className="text-gray-500 pt-1">
              Verify: <code className="text-gray-300">HMAC-SHA256(serverSeed, clientSeed:nonce)</code> = resultBytes
            </p>
          </div>
        </details>
      )}
    </Card>
  );

  const controls = (
    <Card className="p-4 space-y-4">
      <h2 className="text-white font-semibold">Dice</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} />

      {/* Client seed editor */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Your client seed</label>
        <input
          type="text"
          value={pf.clientSeed}
          onChange={(e) => pf.setClientSeed(e.target.value)}
          maxLength={128}
          className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white
                     focus:outline-none focus:ring-1 focus:ring-accent/50 font-mono"
          aria-label="Client seed"
        />
        <p className="text-xs text-gray-600 mt-1">Change this to influence your result — server cannot predict it.</p>
      </div>

      {pf.serverSeedHash && (
        <div className="bg-white/5 rounded-xl p-2 text-xs break-all">
          <p className="text-gray-400 font-medium mb-0.5">Server seed commitment</p>
          <p className="text-accent font-mono">{pf.serverSeedHash}</p>
        </div>
      )}

      <Button variant="primary" size="lg" className="w-full" loading={rolling} onClick={roll}>
        {isConnected ? '🎲 Roll Dice' : 'Connect Wallet'}
      </Button>
      <p className="text-center text-xs text-gray-600">5% house edge · Provably fair · Testnet</p>
    </Card>
  );

  return <GameLayout title="Dice" icon="🎲" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
