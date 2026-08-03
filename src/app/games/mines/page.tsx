'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { minesMultiplier, minesGridFromFloats } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useProvablyFair } from '@/hooks/useProvablyFair';
import toast from 'react-hot-toast';

type TileState = 'hidden' | 'safe' | 'bomb';

export default function MinesPage() {
  const { isConnected, connect } = useWalletStore();
  const pf = useProvablyFair('mines');

  const [stakeXlm, setStakeXlm] = useState(10);
  const [bombCount, setBombCount] = useState(3);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [revealed, setRevealed] = useState<TileState[]>(Array(25).fill('hidden'));
  const [truth, setTruth] = useState<boolean[]>(Array(25).fill(false)); // true = bomb
  const [picked, setPicked] = useState(0);
  const [won, setWon] = useState<boolean | null>(null);
  const [finalMult, setFinalMult] = useState(1);

  const currentMult = picked > 0 ? minesMultiplier(picked, bombCount) : 1;

  async function startGame() {
    if (!isConnected) { connect(); return; }

    try {
      // Step 1 — commit before the grid is generated
      await pf.commit();

      // Step 2 — reveal immediately to get the seed-derived grid
      // (In Mines the grid is set at round start, not on each tile pick)
      const floats = await pf.reveal(25);
      const grid = minesGridFromFloats(bombCount, floats);

      setTruth(grid);
      setRevealed(Array(25).fill('hidden'));
      setPicked(0);
      setWon(null);
      setPhase('playing');
      toast.success(`${formatXlm(stakeXlm)} bet placed — pick your tiles!`, { icon: '💣' });
    } catch {
      toast.error('Could not reach server — try again');
    }
  }

  function pickTile(idx: number) {
    if (phase !== 'playing' || revealed[idx] !== 'hidden') return;
    const isBomb = truth[idx];
    const newRev = [...revealed];
    newRev[idx] = isBomb ? 'bomb' : 'safe';
    setRevealed(newRev);

    if (isBomb) {
      // Reveal all bombs
      const full = truth.map((b, i) => (newRev[i] !== 'hidden' ? newRev[i] : b ? 'bomb' : 'safe')) as TileState[];
      setRevealed(full);
      setWon(false);
      setFinalMult(0);
      setPhase('over');
      toast.error('💥 Boom! Hit a mine.');
    } else {
      const newPicked = picked + 1;
      setPicked(newPicked);
      if (newPicked === 25 - bombCount) {
        const m = minesMultiplier(newPicked, bombCount);
        setFinalMult(m);
        setWon(true);
        setPhase('over');
        toast.success(`All safe! Won ${formatXlm(stakeXlm * m)}`, { icon: '🏆' });
      }
    }
  }

  function cashOut() {
    if (phase !== 'playing' || picked === 0) return;
    const m = minesMultiplier(picked, bombCount);
    setFinalMult(m);
    setWon(true);
    setPhase('over');
    const full = truth.map((b, i) => (revealed[i] !== 'hidden' ? revealed[i] : b ? 'bomb' : 'safe')) as TileState[];
    setRevealed(full);
    toast.success(`Cashed out! Won ${formatXlm(stakeXlm * m)}`, { icon: '💸' });
  }

  const canvas = (
    <Card className="p-4">
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 mb-1">
          {phase === 'playing' ? `${picked} tiles found` : 'Current multiplier'}
        </p>
        <p className={`text-4xl font-bold tabular-nums ${phase === 'over' && !won ? 'text-red-400' : 'text-accent'}`}>
          {phase === 'over' ? (won ? `${finalMult.toFixed(2)}x` : '💥') : `${currentMult.toFixed(2)}x`}
        </p>
        {phase === 'playing' && picked > 0 && (
          <p className="text-sm text-gray-400 mt-0.5">Potential: {formatXlm(stakeXlm * currentMult)}</p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2" role="grid" aria-label="Mines game grid">
        {revealed.map((state, i) => (
          <button key={i} onClick={() => pickTile(i)}
            disabled={phase !== 'playing' || state !== 'hidden'}
            role="gridcell"
            aria-label={state === 'hidden' ? `Tile ${i + 1}` : state === 'safe' ? 'Safe tile' : 'Mine'}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center
              transition-all duration-150 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
              ${state === 'hidden'
                ? phase === 'playing'
                  ? 'bg-brand-600 border-white/10 hover:bg-brand-500 hover:border-accent/40 cursor-pointer hover:scale-105'
                  : 'bg-brand-600 border-white/10 opacity-60 cursor-not-allowed'
                : state === 'safe'
                  ? 'bg-win/20 border-win/40 scale-95'
                  : 'bg-red-500/20 border-red-500/40 animate-pulse'}`}>
            {state === 'safe' ? '💎' : state === 'bomb' ? '💣' : ''}
          </button>
        ))}
      </div>

      {phase === 'playing' && picked > 0 && (
        <Button variant="gold" size="lg" className="w-full mt-4" onClick={cashOut}>
          💸 Cash Out — {formatXlm(stakeXlm * currentMult)}
        </Button>
      )}

      <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={finalMult} />

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
      <h2 className="text-white font-semibold">Mines</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} disabled={phase === 'playing'} />

      <div>
        <label className="text-xs text-gray-400 block mb-2">
          Mines: <span className="text-white font-bold">{bombCount}</span>
        </label>
        <input type="range" min={1} max={24} value={bombCount}
          disabled={phase === 'playing'}
          onChange={(e) => setBombCount(Number(e.target.value))}
          className="w-full accent-accent disabled:opacity-50"
          aria-label={`Number of mines: ${bombCount}`} />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>1 mine (easy)</span><span>24 mines (insane)</span>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 text-xs space-y-1">
        <p className="text-gray-400 font-medium mb-2">Multipliers ({bombCount} mines)</p>
        {[1,2,3,4,5].map(n => (
          <div key={n} className="flex justify-between">
            <span className="text-gray-500">{n} tile{n>1?'s':''}</span>
            <span className="text-accent font-mono">{minesMultiplier(n, bombCount).toFixed(2)}x</span>
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Your client seed</label>
        <input type="text" value={pf.clientSeed} onChange={(e) => pf.setClientSeed(e.target.value)}
          maxLength={128} disabled={phase === 'playing'}
          className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white
                     focus:outline-none focus:ring-1 focus:ring-accent/50 font-mono disabled:opacity-50"
          aria-label="Client seed" />
      </div>

      {(phase === 'idle' || phase === 'over') && (
        <Button variant="primary" size="lg" className="w-full" onClick={startGame}>
          {phase === 'over' ? '🔄 Play Again' : isConnected ? '💣 Start Game' : 'Connect Wallet'}
        </Button>
      )}
      <p className="text-center text-xs text-gray-600">5% house edge · Provably fair · Testnet</p>
    </Card>
  );

  return <GameLayout title="Mines" icon="💣" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
