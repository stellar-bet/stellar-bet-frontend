'use client';

import { useBetSlipStore } from '@/store/betSlipStore';
import { useWalletStore } from '@/store/walletStore';
import { calcPayout, formatXlm } from '@/lib/utils';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { CONTRACT_IDS } from '@/lib/constants';
import { signTx, validateNetwork } from '@/lib/freighter';
import { STELLAR_NETWORK } from '@/lib/constants';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function BetSlip() {
  const { item, stakeXlm, setStake, clearBetSlip, isSubmitting, setSubmitting, setSubmitError } =
    useBetSlipStore();
  const { address, isConnected, network, connect } = useWalletStore();
  const { format } = useOddsStore();

  const potentialPayout = item ? calcPayout(stakeXlm, item.oddsBps) : 0;
  const profit = potentialPayout - stakeXlm;

  async function handlePlaceBet() {
    if (!item || !address || !isConnected) return;

    if (!validateNetwork(network, STELLAR_NETWORK)) {
      toast.error(`Switch Freighter to ${STELLAR_NETWORK}`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!CONTRACT_IDS.bettingPool) {
        // Preview mode — no contracts deployed yet
        await new Promise((r) => setTimeout(r, 1200));
        toast.success(`Bet placed on ${item.outcomeName}! (Testnet preview)`, {
          icon: '🎉', duration: 4000,
        });
        clearBetSlip();
        return;
      }

      // Contracts deployed — call backend to build the transaction XDR,
      // then sign with Freighter and submit
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/bets/build-tx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bettor: address,
          marketId: item.marketId,
          outcomeIndex: item.outcomeIndex,
          stakeXlm,
          oddsBps: item.oddsBps,
        }),
      });
      const { txXdr, networkPassphrase } = await res.json();
      const signedXdr = await signTx(txXdr, networkPassphrase);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/bets/submit-tx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedXdr }),
      });

      toast.success(`Bet placed on ${item.outcomeName}!`, { icon: '🎉', duration: 4000 });
      clearBetSlip();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place bet';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!item) return null;

  return (
    <Card className="p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm">Bet Slip</h2>
        <button
          onClick={clearBetSlip}
          className="text-gray-500 hover:text-white transition-colors text-xs"
          aria-label="Clear bet slip"
        >
          ✕ Clear
        </button>
      </div>

      {/* Selection */}
      <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
        <p className="text-xs text-gray-400 mb-1">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">{item.outcomeName}</span>
          <span className="text-accent font-bold">{formatOdds(item.oddsBps, format)}</span>
        </div>
      </div>

      {/* Stake input */}
      <div className="mb-4">
        <label htmlFor="stake-input" className="block text-xs text-gray-400 mb-1.5">
          Stake (XLM)
        </label>
        <div className="relative">
          <input
            id="stake-input"
            type="number"
            min={1}
            step={1}
            value={stakeXlm}
            onChange={(e) => setStake(Number(e.target.value))}
            className="w-full bg-brand-600 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
            aria-label="Stake amount in XLM"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
            XLM
          </span>
        </div>

        {/* Quick stake buttons */}
        <div className="flex gap-2 mt-2" role="group" aria-label="Quick stake amounts">
          {[5, 10, 25, 50].map((amount) => (
            <button
              key={amount}
              onClick={() => setStake(amount)}
              className="flex-1 text-xs py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label={`Set stake to ${amount} XLM`}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Payout summary */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Stake</span>
          <span className="text-white">{formatXlm(stakeXlm)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Potential profit</span>
          <span className="text-win">+{formatXlm(profit)}</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
          <span className="text-gray-300">Potential return</span>
          <span className="text-accent">{formatXlm(potentialPayout)}</span>
        </div>
      </div>

      {/* CTA */}
      {isConnected ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          onClick={handlePlaceBet}
          aria-label={`Place ${formatXlm(stakeXlm)} bet on ${item.outcomeName}`}
        >
          Place Bet
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={connect}
        >
          Connect Wallet to Bet
        </Button>
      )}

      <p className="text-center text-xs text-gray-600 mt-3">
        Testnet only · No real funds · Built on Soroban
      </p>
    </Card>
  );
}
