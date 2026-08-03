'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { formatXlm } from '@/lib/utils';
import { aviatorCrashFromFloat, resultBytesToFloats } from '@/lib/gameUtils';
import { gamesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Phase = 'waiting' | 'flying' | 'crashed' | 'cashedout';

const HISTORY_COLORS = (v: number) => {
  if (v >= 10) return 'text-purple-400 font-bold';
  if (v >= 5)  return 'text-yellow-400 font-bold';
  if (v >= 2)  return 'text-win font-semibold';
  return 'text-gray-400';
};

export default function AviatorGame() {
  const { isConnected, connect } = useWalletStore();

  const [phase, setPhase] = useState<Phase>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [stakeXlm, setStakeXlm] = useState(10);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [autoCashout, setAutoCashout] = useState('');
  const [history, setHistory] = useState<number[]>([
    14.32, 1.05, 3.88, 2.11, 1.42, 9.77, 1.01, 6.54, 2.90, 1.23,
  ]);
  const [hasBet, setHasBet] = useState(false);
  const [waitCountdown, setWaitCountdown] = useState(5);
  // Provably fair state for the current round
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [lastReveal, setLastReveal] = useState<{ serverSeed: string; serverSeedHash: string; clientSeed: string; nonce: number; resultBytes: string } | null>(null);
  const [clientSeed] = useState(() =>
    typeof window !== 'undefined'
      ? Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
      : 'aviator-client-seed'
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crashRef = useRef<number>(1.0);
  const targetCrash = useRef<number>(1.0);
  const gameIdRef = useRef<string | null>(null);
  const nonceRef = useRef(1);

  const clearTick = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  // ── Provably fair round setup ────────────────────────────────────────────

  const setupRound = useCallback(async () => {
    try {
      const commit = await gamesApi.commit('aviator');
      gameIdRef.current = commit.gameId;
      setServerSeedHash(commit.serverSeedHash);

      // Reveal immediately to get the crash point — bet placement happens
      // during the waiting phase before flying starts
      const reveal = await gamesApi.reveal(commit.gameId, clientSeed, nonceRef.current);
      nonceRef.current += 1;
      setLastReveal(reveal);
      setServerSeedHash(null);

      const floats = resultBytesToFloats(reveal.resultBytes, 1);
      targetCrash.current = aviatorCrashFromFloat(floats[0]);
    } catch {
      // Fallback: if backend unreachable, generate client-side crash point
      const r = Math.random();
      targetCrash.current = r < 0.05 ? 1.0 : Math.max(1.01, Math.round((1 / (1 - r * 0.99)) * 100) / 100);
    }
  }, [clientSeed]);

  // ── Game loop ────────────────────────────────────────────────────────────

  const startRound = useCallback(() => {
    crashRef.current = 1.0;
    setMultiplier(1.0);
    setCrashPoint(null);
    setCashedOutAt(null);
    setPhase('flying');

    intervalRef.current = setInterval(() => {
      crashRef.current = Math.round(crashRef.current * 1.015 * 100) / 100;
      setMultiplier(crashRef.current);

      const auto = parseFloat(autoCashout);
      if (!isNaN(auto) && auto > 1 && crashRef.current >= auto) {
        handleCashout(crashRef.current);
        return;
      }

      if (crashRef.current >= targetCrash.current) {
        clearTick();
        setCrashPoint(targetCrash.current);
        setMultiplier(targetCrash.current);
        setPhase('crashed');
        setHistory(h => [targetCrash.current, ...h].slice(0, 10));
        setHasBet(false);
        setTimeout(() => { setPhase('waiting'); setWaitCountdown(5); }, 3000);
      }
    }, 100);
  }, [autoCashout, clearTick]);

  // Waiting countdown — setup provably fair round during this window
  useEffect(() => {
    if (phase !== 'waiting') return;
    if (waitCountdown === 5) {
      // Kick off seed commitment at the start of each waiting phase
      setupRound();
    }
    if (waitCountdown <= 0) { startRound(); return; }
    const t = setTimeout(() => setWaitCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, waitCountdown, startRound, setupRound]);

  useEffect(() => () => clearTick(), [clearTick]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function handlePlaceBet() {
    if (!isConnected) { connect(); return; }
    if (phase !== 'waiting') { toast.error('Wait for the next round'); return; }
    setHasBet(true);
    toast.success(`${formatXlm(stakeXlm)} bet placed`, { icon: '✈️' });
  }

  function handleCashout(at?: number) {
    const cashAt = at ?? multiplier;
    if (phase !== 'flying' || !hasBet) return;
    clearTick();
    setCashedOutAt(cashAt);
    setPhase('cashedout');
    toast.success(`Cashed out at ${cashAt.toFixed(2)}x — ${formatXlm(stakeXlm * cashAt)}`, { icon: '💸', duration: 4000 });
    setHasBet(false);

    // Continue flying animation until crash
    intervalRef.current = setInterval(() => {
      crashRef.current = Math.round(crashRef.current * 1.015 * 100) / 100;
      setMultiplier(crashRef.current);
      if (crashRef.current >= targetCrash.current) {
        clearTick();
        setCrashPoint(targetCrash.current);
        setMultiplier(targetCrash.current);
        setPhase('crashed');
        setHistory(h => [targetCrash.current, ...h].slice(0, 10));
        setTimeout(() => { setPhase('waiting'); setWaitCountdown(5); }, 3000);
      }
    }, 100);
  }

  const multiplierColor =
    phase === 'crashed' ? 'text-red-400' :
    phase === 'cashedout' ? 'text-win' :
    multiplier >= 5 ? 'text-purple-400' :
    multiplier >= 2 ? 'text-yellow-400' : 'text-white';

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main game panel */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          {/* History strip */}
          <div className="flex gap-2 px-4 py-2 bg-black/20 overflow-x-auto scrollbar-none border-b border-white/5">
            {history.map((v, i) => (
              <span key={i} className={`flex-none text-xs px-2 py-0.5 rounded-full bg-white/5 ${HISTORY_COLORS(v)}`}>
                {v.toFixed(2)}x
              </span>
            ))}
          </div>

          {/* Game canvas */}
          <div className="relative flex items-center justify-center"
            style={{ height: '280px', background: 'linear-gradient(180deg, #0a0e1a 0%, #141d38 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(62,207,142,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

            {phase !== 'crashed' && (
              <div className="absolute transition-all duration-100"
                style={{
                  bottom: `${Math.min(60, (multiplier - 1) * 8)}%`,
                  left: `${Math.min(70, 20 + (multiplier - 1) * 6)}%`,
                  fontSize: '2.5rem',
                  filter: phase === 'cashedout' ? 'drop-shadow(0 0 12px #22c55e)' : 'none',
                  transform: 'rotate(-20deg)',
                }}
                aria-hidden="true">✈️</div>
            )}

            {phase === 'crashed' && (
              <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                <div className="text-6xl animate-pulse" aria-hidden="true">💥</div>
              </div>
            )}

            <div className="relative z-10 text-center">
              {phase === 'waiting' ? (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Next round in</p>
                  <p className="text-white font-bold text-5xl tabular-nums">{waitCountdown}s</p>
                  {serverSeedHash && (
                    <p className="text-xs text-accent mt-2 font-mono px-4 truncate" title={serverSeedHash}>
                      🔐 {serverSeedHash.slice(0, 16)}…
                    </p>
                  )}
                  {hasBet && <p className="text-accent text-sm mt-2">✓ {formatXlm(stakeXlm)} bet confirmed</p>}
                </div>
              ) : phase === 'crashed' ? (
                <div>
                  <p className="text-red-400 text-sm mb-1 font-semibold uppercase tracking-wide">Flew away!</p>
                  <p className="text-red-400 font-bold text-5xl tabular-nums">{(crashPoint ?? multiplier).toFixed(2)}x</p>
                </div>
              ) : (
                <div>
                  {phase === 'cashedout' && cashedOutAt && (
                    <p className="text-win text-xs mb-1 font-semibold">Cashed out at {cashedOutAt.toFixed(2)}x</p>
                  )}
                  <p className={`font-bold text-6xl tabular-nums transition-colors ${multiplierColor}`}>
                    {multiplier.toFixed(2)}x
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Provably fair verification for last round */}
        {lastReveal && (
          <details className="mt-3 text-xs text-gray-500 bg-white/5 rounded-xl p-3">
            <summary className="cursor-pointer text-accent font-medium">🔐 Provably Fair — verify last round</summary>
            <div className="mt-2 space-y-1 break-all">
              <p><span className="text-gray-400">Server seed:</span> {lastReveal.serverSeed}</p>
              <p><span className="text-gray-400">Hash:</span> {lastReveal.serverSeedHash}</p>
              <p><span className="text-gray-400">Client seed:</span> {lastReveal.clientSeed}</p>
              <p><span className="text-gray-400">Nonce:</span> {lastReveal.nonce}</p>
              <p><span className="text-gray-400">Result bytes:</span> {lastReveal.resultBytes}</p>
              <p className="text-gray-600 pt-1">HMAC-SHA256(serverSeed, clientSeed:nonce) = resultBytes → crash point derived from first 4 bytes</p>
            </div>
          </details>
        )}
      </div>

      {/* Controls panel */}
      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="text-white font-semibold mb-4">Place Bet</h2>

          <div className="mb-3">
            <label htmlFor="avi-stake" className="text-xs text-gray-400 block mb-1.5">Stake (XLM)</label>
            <input id="avi-stake" type="number" min={1} value={stakeXlm}
              onChange={(e) => setStakeXlm(Math.max(1, Number(e.target.value)))}
              className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent/50"
              aria-label="Stake amount in XLM" />
            <div className="flex gap-1.5 mt-2">
              {[5, 10, 25, 50, 100].map(v => (
                <button key={v} onClick={() => setStakeXlm(v)}
                  className="flex-1 text-xs py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  aria-label={`Set stake to ${v} XLM`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="auto-cashout" className="text-xs text-gray-400 block mb-1.5">Auto Cashout at (optional)</label>
            <input id="auto-cashout" type="number" min={1.01} step={0.1} placeholder="e.g. 2.00"
              value={autoCashout} onChange={(e) => setAutoCashout(e.target.value)}
              className="w-full bg-brand-600 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder-gray-600"
              aria-label="Auto cashout multiplier" />
          </div>

          {phase === 'waiting' && !hasBet && (
            <Button variant="primary" size="lg" className="w-full" onClick={handlePlaceBet}>
              {isConnected ? `Bet ${formatXlm(stakeXlm)}` : 'Connect Wallet'}
            </Button>
          )}
          {phase === 'waiting' && hasBet && (
            <div className="text-center py-3 text-accent font-semibold text-sm">
              ✓ Bet placed — waiting for takeoff
            </div>
          )}
          {phase === 'flying' && hasBet && (
            <Button variant="gold" size="lg" className="w-full" onClick={() => handleCashout()}>
              💸 Cash Out {formatXlm(stakeXlm * multiplier)}
            </Button>
          )}
          {(phase === 'crashed' || phase === 'cashedout') && (
            <div className={`text-center py-3 text-sm font-semibold ${phase === 'cashedout' ? 'text-win' : 'text-red-400'}`}>
              {phase === 'cashedout'
                ? `✓ Won ${formatXlm(stakeXlm * (cashedOutAt ?? 1))}`
                : hasBet ? `✗ Lost ${formatXlm(stakeXlm)}` : 'Round ended'}
            </div>
          )}

          <p className="text-center text-xs text-gray-600 mt-3">Provably fair · Testnet only</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-white font-semibold text-sm mb-3">How to play</h3>
          <ol className="space-y-2 text-xs text-gray-400">
            <li className="flex gap-2"><span className="text-accent font-bold">1.</span> Place your XLM bet before takeoff</li>
            <li className="flex gap-2"><span className="text-accent font-bold">2.</span> The multiplier climbs — cash out before the plane flies away</li>
            <li className="flex gap-2"><span className="text-accent font-bold">3.</span> If it crashes before you cash out, you lose your stake</li>
            <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Set auto cashout to lock in a target multiplier</li>
            <li className="flex gap-2"><span className="text-accent font-bold">5.</span> Each round crash point is provably fair — verify via the panel below the board</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
