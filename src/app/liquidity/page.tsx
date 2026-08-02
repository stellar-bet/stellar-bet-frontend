'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { liquidityApi } from '@/lib/api';
import { useWalletStore } from '@/store/walletStore';
import { formatXlm } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LiquidityPage() {
  const { isConnected, connect } = useWalletStore();
  const [depositAmount, setDepositAmount] = useState(100);
  const [isDepositing, setIsDepositing] = useState(false);

  const { data: poolStats, isLoading } = useQuery({
    queryKey: ['pool-stats'],
    queryFn: liquidityApi.stats,
    refetchInterval: 30_000,
  });

  async function handleDeposit() {
    if (!isConnected) { connect(); return; }
    setIsDepositing(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success(`${formatXlm(depositAmount)} deposited to liquidity pool! 💧`);
    setIsDepositing(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-3 py-5 space-y-4">

      {/* Header */}
      <div className="section-header rounded-t">
        💧 Earn with Liquidity
      </div>
      <div className="bg-white border border-sp-border border-t-0 rounded-b p-4 shadow-sm -mt-4">
        <p className="text-sm text-sp-muted">
          Provide XLM to back the house pool and earn a share of protocol fees from every winning bet.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({length:3}).map((_,i) => (
            <div key={i} className="bg-white border border-sp-border rounded-lg p-4 animate-pulse h-20" />
          ))
        ) : (
          [
            { label:'Total Pool', value:poolStats?`${poolStats.totalLiquidityXlm.toLocaleString()} XLM`:'—', icon:'🏦', color:'text-sp-green' },
            { label:'Protocol Fee', value:poolStats?`${poolStats.feePercent}%`:'—', icon:'💰', color:'text-sp-odds' },
            { label:'Fees Earned', value:poolStats?`${poolStats.totalFeesXlm.toFixed(2)} XLM`:'—', icon:'📈', color:'text-sp-yellow' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-sp-border rounded-lg p-4 text-center shadow-sm">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-sp-muted mt-0.5">{s.label}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Deposit card */}
        <div className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
          <div className="h-1.5 bg-sp-green" />
          <div className="p-5">
            <h2 className="font-bold text-sp-text text-lg mb-4">Provide Liquidity</h2>

            <div className="mb-4">
              <label htmlFor="deposit" className="text-sm font-semibold text-sp-text block mb-1.5">
                Amount (XLM)
              </label>
              <input id="deposit" type="number" min={10} step={10} value={depositAmount}
                onChange={e => setDepositAmount(Math.max(10, Number(e.target.value)))}
                className="w-full border border-sp-border rounded px-3 py-2.5 text-sp-text text-sm
                           focus:outline-none focus:border-sp-green focus:ring-1 focus:ring-sp-green/30"
              />
              <div className="flex gap-2 mt-2">
                {[50,100,250,500].map(v => (
                  <button key={v} onClick={() => setDepositAmount(v)}
                    className="flex-1 py-1.5 rounded border border-sp-border text-xs font-semibold
                               text-sp-muted hover:bg-sp-green hover:text-white hover:border-sp-green transition-all">
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            <div className="bg-gray-50 rounded border border-sp-border p-3 mb-4 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-sp-muted">You deposit</span>
                <span className="font-bold text-sp-text">{formatXlm(depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sp-muted">Pool share (est.)</span>
                <span className="font-bold text-sp-text">
                  {poolStats ? `${((depositAmount / (poolStats.totalLiquidityXlm + depositAmount)) * 100).toFixed(2)}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sp-muted">Protocol fee earned</span>
                <span className="font-bold text-sp-green">{poolStats ? `${poolStats.feePercent}%` : '—'} of payouts</span>
              </div>
            </div>

            <button onClick={handleDeposit} disabled={isDepositing}
              className="sp-btn-green disabled:opacity-50">
              {isDepositing ? 'Depositing...' : isConnected ? `Deposit ${formatXlm(depositAmount)}` : 'Connect Wallet'}
            </button>

            <p className="text-center text-xs text-sp-muted mt-2">
              Withdraw anytime · Testnet only
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-sp-border rounded-lg shadow-sm p-5">
          <h2 className="font-bold text-sp-text text-lg mb-4">How It Works</h2>
          <ol className="space-y-4">
            {[
              { icon:'1', title:'Deposit XLM', desc:'Deposit XLM into the HouseEscrow contract to receive pool shares.' },
              { icon:'2', title:'Back the House', desc:'The pool backs all winning bet payouts. When a bettor wins, payout comes from the pool minus the protocol fee.' },
              { icon:'3', title:'Earn Fees', desc:'Protocol fees accumulate in the pool, increasing the value of your shares automatically over time.' },
              { icon:'4', title:'Withdraw Anytime', desc:'Withdraw your shares at any time to receive your proportional XLM plus accumulated earnings.' },
            ].map(s => (
              <li key={s.icon} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sp-green text-white flex items-center justify-center text-xs font-black flex-none">
                  {s.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-sp-text">{s.title}</p>
                  <p className="text-xs text-sp-muted mt-0.5">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
