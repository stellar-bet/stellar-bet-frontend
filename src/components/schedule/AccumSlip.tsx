'use client';

import { useAccumStore, calcAccumOdds, calcAccumPayout } from '@/store/accumStore';
import { useWalletStore } from '@/store/walletStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { formatXlm } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AccumSlip() {
  const { selections, stakeXlm, setStake, removeSelection, clearAll,
          isSubmitting, setSubmitting } = useAccumStore();
  const { isConnected, connect } = useWalletStore();
  const { format } = useOddsStore();

  const totalOdds   = calcAccumOdds(selections);
  const totalPayout = calcAccumPayout(stakeXlm, selections);
  const profit      = totalPayout - stakeXlm;

  const betType =
    selections.length === 1 ? 'Single' :
    selections.length === 2 ? 'Double' :
    selections.length === 3 ? 'Treble' :
    `${selections.length}-Fold Acca`;

  async function place() {
    if (!isConnected) { connect(); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`✅ ${betType} placed! Potential: ${formatXlm(totalPayout)}`, {
      duration: 4000,
      style: { background: '#00a651', color: '#fff' },
    });
    clearAll();
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full bg-sp-white">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2.5"
        style={{ background: '#00a651' }}>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">Bet Slip</span>
          {selections.length > 0 && (
            <span className="bg-white text-sp-green text-xs font-black w-5 h-5 rounded-full
                             flex items-center justify-center">
              {selections.length}
            </span>
          )}
        </div>
        {selections.length > 0 && (
          <button onClick={clearAll}
            className="text-white/80 hover:text-white text-xs transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* ── Tabs: Betslip / Open Bets ──────────────────────────── */}
      <div className="flex border-b border-sp-border">
        <div className="flex-1 py-2 text-center text-xs font-bold text-sp-green border-b-2 border-sp-green cursor-pointer">
          Bet Slip
        </div>
        <div className="flex-1 py-2 text-center text-xs text-sp-muted cursor-pointer hover:text-sp-green">
          Open Bets
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {selections.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-3xl" aria-hidden="true">🎯</span>
          </div>
          <p className="text-sp-text font-semibold text-sm mb-1">Your bet slip is empty</p>
          <p className="text-sp-muted text-xs">Click on the odds to add selections</p>
        </div>
      )}

      {/* ── Selections ──────────────────────────────────────────── */}
      {selections.length > 0 && (
        <>
          <div className="overflow-y-auto flex-1">
            {selections.map((sel, idx) => (
              <div key={`${sel.matchId}-${sel.outcomeId}`}
                className="border-b border-sp-border p-3">
                {/* Match name */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="text-2xs text-sp-muted truncate">{sel.competition}</p>
                    <p className="text-xs text-sp-text font-semibold truncate mt-0.5">
                      {sel.matchDesc}
                    </p>
                  </div>
                  <button onClick={() => removeSelection(sel.matchId, sel.outcomeId)}
                    className="text-sp-muted hover:text-sp-live text-xs flex-none mt-0.5 transition-colors"
                    aria-label="Remove">✕</button>
                </div>
                {/* Selection row */}
                <div className="flex items-center justify-between mt-1.5 bg-sp-green3 rounded px-2 py-1.5">
                  <div>
                    <p className="text-2xs text-sp-muted">{sel.marketLabel}</p>
                    <p className="text-sm font-bold text-sp-text">{sel.outcomeLabel}</p>
                  </div>
                  <span className="text-sm font-black text-sp-green tabular-nums">
                    {formatOdds(sel.oddsBps, format)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Combined odds for multi */}
          {selections.length > 1 && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-y border-sp-border">
              <span className="text-xs font-semibold text-sp-text">{betType}</span>
              <span className="text-sm font-black text-sp-green tabular-nums">
                {totalOdds.toFixed(2)}
              </span>
            </div>
          )}

          {/* ── Stake + payout ──────────────────────────────────── */}
          <div className="p-3 space-y-3">
            {/* Stake input */}
            <div>
              <label htmlFor="slip-stake"
                className="text-xs font-semibold text-sp-text block mb-1.5">
                Stake (XLM)
              </label>
              <div className="flex rounded border border-sp-border overflow-hidden">
                <button onClick={() => setStake(Math.max(1, stakeXlm - 5))}
                  className="px-3 py-2 bg-gray-100 text-sp-text font-bold hover:bg-gray-200 transition-colors text-sm">
                  −
                </button>
                <input id="slip-stake" type="number" min={1} value={stakeXlm}
                  onChange={e => setStake(Math.max(1, Number(e.target.value)))}
                  className="flex-1 text-center py-2 text-sp-text font-bold text-sm
                             focus:outline-none focus:ring-1 focus:ring-sp-green border-x border-sp-border"
                />
                <button onClick={() => setStake(stakeXlm + 5)}
                  className="px-3 py-2 bg-gray-100 text-sp-text font-bold hover:bg-gray-200 transition-colors text-sm">
                  +
                </button>
              </div>
              {/* Quick stake buttons */}
              <div className="grid grid-cols-5 gap-1 mt-1.5">
                {[10, 20, 50, 100, 200].map(v => (
                  <button key={v} onClick={() => setStake(v)}
                    className="py-1 text-xs font-semibold rounded border border-sp-border
                               bg-white hover:bg-sp-green hover:text-white hover:border-sp-green
                               text-sp-text transition-all">
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout summary */}
            <div className="bg-gray-50 rounded border border-sp-border p-2.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-sp-muted">Stake</span>
                <span className="font-semibold text-sp-text">{formatXlm(stakeXlm)}</span>
              </div>
              {selections.length > 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-sp-muted">Combined Odds</span>
                  <span className="font-bold text-sp-green">{totalOdds.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs border-t border-sp-border pt-1.5">
                <span className="text-sp-muted">Potential Winnings</span>
                <span className="font-semibold text-sp-text">+{formatXlm(profit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-sp-text">Potential Payout</span>
                <span className="text-sm font-black text-sp-green">{formatXlm(totalPayout)}</span>
              </div>
            </div>

            {/* Place bet CTA */}
            <button onClick={place} disabled={isSubmitting}
              className="sp-btn-green">
              {isSubmitting ? 'Placing...' : isConnected
                ? `Place ${betType} (${formatXlm(stakeXlm)})`
                : 'Login to Place Bet'}
            </button>

            <p className="text-center text-2xs text-sp-muted">
              Testnet only · No real funds · 18+
            </p>
          </div>
        </>
      )}
    </div>
  );
}
