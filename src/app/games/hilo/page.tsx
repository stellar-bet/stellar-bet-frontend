'use client';

import { useState } from 'react';
import GameLayout, { StakeControl, ResultBanner } from '@/components/games/GameLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { hiloMultiplier, hiloDecodeFromFloats, PlayingCard } from '@/lib/gameUtils';
import { formatXlm } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useProvablyFair } from '@/hooks/useProvablyFair';
import toast from 'react-hot-toast';

function CardFace({ card, hidden }: { card: PlayingCard | null; hidden?: boolean }) {
  if (!card || hidden) {
    return (
      <div className="w-24 h-36 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 border border-white/10 flex items-center justify-center text-4xl">
        🂠
      </div>
    );
  }
  return (
    <div className={`w-24 h-36 rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-lg
      ${card.isRed ? 'bg-gradient-to-br from-red-950 to-red-900 border-red-700/40' : 'bg-gradient-to-br from-brand-800 to-brand-700 border-white/20'}`}>
      <span className={`text-4xl font-black ${card.isRed ? 'text-red-400' : 'text-white'}`}>{card.rank}</span>
      <span className={`text-2xl ${card.isRed ? 'text-red-400' : 'text-white'}`}>{card.suit}</span>
    </div>
  );
}

export default function HiLoPage() {
  const { isConnected, connect } = useWalletStore();
  const pf = useProvablyFair('hilo');

  const [stakeXlm, setStakeXlm] = useState(10);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [currentCard, setCurrentCard] = useState<PlayingCard | null>(null);
  const [nextCard, setNextCard] = useState<PlayingCard | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [won, setWon] = useState<boolean | null>(null);
  const [totalMult, setTotalMult] = useState(1);
  const [streak, setStreak] = useState(0);
  const [guess, setGuess] = useState<'higher' | 'lower' | 'equal' | null>(null);

  async function startGame() {
    if (!isConnected) { connect(); return; }
    try {
      await pf.commit();
      // 52 floats to deterministically shuffle the deck
      const floats = await pf.reveal(52);
      const shuffled = hiloDecodeFromFloats(floats);
      setDeck(shuffled.slice(2));
      setCurrentCard(shuffled[0]);
      setNextCard(null);
      setPhase('playing');
      setWon(null);
      setTotalMult(1);
      setStreak(0);
      setGuess(null);
    } catch {
      toast.error('Could not reach server — try again');
    }
  }

  function makeGuess(g: 'higher' | 'lower' | 'equal') {
    if (phase !== 'playing' || !currentCard || deck.length === 0) return;
    const next = deck[0];
    const newDeck = deck.slice(1);
    setNextCard(next);
    setGuess(g);

    let correct = false;
    if (g === 'higher') correct = next.value > currentCard.value;
    else if (g === 'lower') correct = next.value < currentCard.value;
    else correct = next.value === currentCard.value;

    if (correct) {
      const mult = hiloMultiplier(currentCard.value, g);
      const newMult = Math.round(totalMult * mult * 100) / 100;
      setTotalMult(newMult);
      setStreak(s => s + 1);
      toast.success(`Correct! ×${mult.toFixed(2)} → Total: ${newMult.toFixed(2)}x`, { duration: 1500 });

      setTimeout(() => {
        setCurrentCard(next);
        setNextCard(null);
        setDeck(newDeck);
        setGuess(null);
        if (newDeck.length === 0) {
          setWon(true);
          setPhase('over');
          toast.success(`Full deck! Won ${formatXlm(stakeXlm * newMult)}`, { icon: '🏆' });
        }
      }, 800);
    } else {
      setWon(false);
      setPhase('over');
      toast.error(`Wrong! The card was ${next.rank}${next.suit}`);
    }
  }

  function cashOut() {
    if (phase !== 'playing' || streak === 0) return;
    setWon(true);
    setPhase('over');
    toast.success(`Cashed out! Won ${formatXlm(stakeXlm * totalMult)}`, { icon: '💸' });
  }

  const multOptions = currentCard ? [
    { label: '🔼 Higher', value: 'higher' as const, mult: hiloMultiplier(currentCard.value, 'higher') },
    { label: '🔽 Lower',  value: 'lower'  as const, mult: hiloMultiplier(currentCard.value, 'lower')  },
    { label: '= Equal',   value: 'equal'  as const, mult: hiloMultiplier(currentCard.value, 'equal')  },
  ] : [];

  const canvas = (
    <Card className="p-6">
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Current</p>
          <CardFace card={currentCard} />
        </div>
        <div className="text-4xl text-gray-600" aria-hidden="true">→</div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Next</p>
          <CardFace card={nextCard} hidden={!nextCard} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mb-6">
        {[
          { label: 'Multiplier', value: `${totalMult.toFixed(2)}x`, color: 'text-accent' },
          { label: 'Streak', value: streak, color: 'text-yellow-400' },
          { label: 'Winnable', value: formatXlm(stakeXlm * totalMult), color: 'text-win' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {phase === 'playing' && !guess && (
        <div className="grid grid-cols-3 gap-2">
          {multOptions.map(o => (
            <button key={o.value} onClick={() => makeGuess(o.value)}
              className="flex flex-col items-center py-3 rounded-xl bg-white/5 border border-white/10
                         hover:bg-accent/20 hover:border-accent transition-all"
              aria-label={`Guess ${o.value}`}>
              <span className="text-lg">{o.label.split(' ')[0]}</span>
              <span className="text-white text-xs font-semibold mt-1">{o.label.split(' ')[1]}</span>
              <span className="text-accent text-xs mt-0.5">{o.mult.toFixed(2)}x</span>
            </button>
          ))}
        </div>
      )}

      {phase === 'playing' && streak > 0 && !guess && (
        <Button variant="gold" size="md" className="w-full mt-3" onClick={cashOut}>
          💸 Cash Out — {formatXlm(stakeXlm * totalMult)}
        </Button>
      )}

      <ResultBanner won={won} stakeXlm={stakeXlm} multiplier={totalMult} />

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
      <h2 className="text-white font-semibold">HiLo</h2>
      <StakeControl stakeXlm={stakeXlm} setStake={setStakeXlm} disabled={phase === 'playing'} />

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
          {phase === 'over' ? '🔄 Play Again' : isConnected ? '🃏 Start Game' : 'Connect Wallet'}
        </Button>
      )}

      <div className="bg-white/5 rounded-xl p-3 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-white mb-1">How to play</p>
        <p>Guess if the next card is Higher, Lower, or Equal.</p>
        <p>Each correct guess multiplies your winnings.</p>
        <p>Cash out any time to lock in your profit.</p>
      </div>
      <p className="text-center text-xs text-gray-600">5% house edge · Provably fair · Testnet</p>
    </Card>
  );

  return <GameLayout title="HiLo" icon="🃏" canvas={canvas} controls={controls}>{null}</GameLayout>;
}
