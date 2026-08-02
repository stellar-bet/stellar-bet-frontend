'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWalletStore } from '@/store/walletStore';
import { useAccumStore, calcAccumOdds } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { formatXlm } from '@/lib/utils';

const DEMO_BETS = [
  { id:'1', desc:'Arsenal vs Man Utd', pick:'Arsenal', market:'Match Result', oddsBps:21000, stakeXlm:50, status:'Won',    result:'+55.00 XLM', date:'Today 14:00' },
  { id:'2', desc:'Nigeria vs Senegal', pick:'Draw',    market:'Match Result', oddsBps:29000, stakeXlm:20, status:'Open',   result:'Pending',    date:'Today 17:00' },
  { id:'3', desc:'Lakers vs Celtics',  pick:'Lakers',  market:'Match Result', oddsBps:21000, stakeXlm:25, status:'Lost',   result:'-25.00 XLM', date:'Yesterday' },
  { id:'4', desc:'Over/Under 2.5 — EPL', pick:'Over 2.5', market:'Over/Under', oddsBps:18500, stakeXlm:30, status:'Won',  result:'+25.50 XLM', date:'Yesterday' },
  { id:'5', desc:'Mines — 3 bombs',    pick:'Cashout 3.2x', market:'Casino', oddsBps:32000, stakeXlm:20, status:'Won',    result:'+44.00 XLM', date:'2 days ago' },
  { id:'6', desc:'Real Madrid vs Sevilla', pick:'Real Madrid', market:'Match Result', oddsBps:16000, stakeXlm:40, status:'Open', result:'Pending', date:'Today 21:00' },
];

const STATUS_STYLE: Record<string,string> = {
  Won:  'bg-green-100 text-green-700 border border-green-200',
  Lost: 'bg-red-100 text-sp-live border border-red-200',
  Open: 'bg-blue-100 text-blue-700 border border-blue-200',
};

type Tab = 'all'|'open'|'settled'|'slip';

export default function MyBetsPage() {
  const { isConnected, connect } = useWalletStore();
  const { selections, stakeXlm } = useAccumStore();
  const { format } = useOddsStore();
  const [tab, setTab] = useState<Tab>('all');

  const accumOdds = calcAccumOdds(selections);
  const accumPayout = stakeXlm * accumOdds;

  const filtered = DEMO_BETS.filter(b => {
    if (tab === 'open')    return b.status === 'Open';
    if (tab === 'settled') return b.status !== 'Open';
    return true;
  });

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-xl font-bold text-sp-text mb-2">Login to view your bets</h1>
        <p className="text-sp-muted text-sm mb-6">Connect your Freighter wallet to see your bet history.</p>
        <button onClick={connect} className="sp-btn-green max-w-xs mx-auto">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">
      <h1 className="text-xl font-black text-sp-text">My Bets</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label:'Total Bets', value:DEMO_BETS.length,                                  icon:'🎯', color:'text-sp-text' },
          { label:'Won',        value:DEMO_BETS.filter(b=>b.status==='Won').length,       icon:'✅', color:'text-green-600' },
          { label:'Open',       value:DEMO_BETS.filter(b=>b.status==='Open').length,      icon:'⏳', color:'text-sp-yellow' },
          { label:'Lost',       value:DEMO_BETS.filter(b=>b.status==='Lost').length,      icon:'❌', color:'text-sp-live' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-sp-border rounded-lg p-3 text-center shadow-sm">
            <p className="text-lg">{s.icon}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-2xs text-sp-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border border-sp-border rounded overflow-hidden bg-white shadow-sm" role="tablist">
        {[
          { id:'all',     label:'All Bets' },
          { id:'open',    label:'Open' },
          { id:'settled', label:'Settled' },
          { id:'slip',    label:`Bet Slip (${selections.length})` },
        ].map(t => (
          <button key={t.id} role="tab" aria-selected={tab===t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors
              ${tab===t.id ? 'bg-sp-green text-white' : 'text-sp-muted hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Slip tab */}
      {tab === 'slip' && (
        selections.length === 0 ? (
          <div className="bg-white border border-sp-border rounded-lg shadow-sm py-14 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-sp-muted font-medium">Your bet slip is empty.</p>
            <p className="text-sp-muted text-sm mt-1">
              Go to <Link href="/sports" className="text-sp-green font-semibold hover:underline">Sports</Link> and click any odds.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-sp-green3 border-b border-sp-border">
              <h2 className="font-bold text-sp-text">
                {selections.length === 1 ? 'Single' : selections.length === 2 ? 'Double' : selections.length === 3 ? 'Treble' : `${selections.length}-Fold Acca`}
              </h2>
              <p className="text-xs text-sp-muted mt-0.5">
                Combined odds: <span className="font-black text-sp-green">{accumOdds.toFixed(2)}x</span>
                {' · '}Potential return: <span className="font-black text-green-600">{formatXlm(accumPayout)}</span>
              </p>
            </div>
            {selections.map(sel => (
              <div key={`${sel.matchId}-${sel.outcomeId}`}
                className="px-4 py-3 border-b border-sp-border last:border-0 flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-sp-text truncate">{sel.matchDesc}</p>
                  <p className="text-xs text-sp-muted mt-0.5">{sel.marketLabel} — <span className="text-sp-green font-semibold">{sel.outcomeLabel}</span></p>
                  <p className="text-xs text-sp-muted">{sel.competition}</p>
                </div>
                <span className="font-black text-sp-odds text-sm ml-4 flex-none">{formatOdds(sel.oddsBps, format)}</span>
              </div>
            ))}
          </div>
        )
      )}

      {/* Bets table */}
      {tab !== 'slip' && (
        <div className="bg-white border border-sp-border rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-sp-border text-2xs text-sp-muted font-bold uppercase tracking-wide">
            <div className="col-span-4">Match</div>
            <div className="col-span-2">Selection</div>
            <div className="col-span-1 text-center">Odds</div>
            <div className="col-span-1 text-center">Stake</div>
            <div className="col-span-2 text-right">Result</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sp-muted">No {tab} bets found.</div>
          ) : (
            filtered.map((bet, idx) => (
              <div key={bet.id}
                className={`flex sm:grid sm:grid-cols-12 gap-2 items-center px-4 py-3 border-b border-sp-border last:border-0 hover:bg-gray-50 transition-colors ${idx%2===0?'bg-white':'bg-sp-row'}`}>
                <div className="sm:col-span-4 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sp-text truncate">{bet.desc}</p>
                  <p className="text-2xs text-sp-muted">{bet.date}</p>
                </div>
                <div className="sm:col-span-2 hidden sm:block min-w-0">
                  <p className="text-xs text-sp-text truncate">{bet.pick}</p>
                  <p className="text-2xs text-sp-muted truncate">{bet.market}</p>
                </div>
                <div className="sm:col-span-1 sm:text-center flex-none">
                  <span className="text-sm font-bold text-sp-odds">{formatOdds(bet.oddsBps, format)}</span>
                </div>
                <div className="sm:col-span-1 sm:text-center hidden sm:block">
                  <span className="text-sm text-sp-text">{bet.stakeXlm}</span>
                </div>
                <div className="sm:col-span-2 sm:text-right flex-none">
                  <span className={`text-sm font-bold ${
                    bet.status==='Won' ? 'text-green-600' :
                    bet.status==='Lost' ? 'text-sp-live' : 'text-sp-yellow'
                  }`}>{bet.result}</span>
                </div>
                <div className="sm:col-span-2 sm:text-right flex-none">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_STYLE[bet.status] ?? 'bg-gray-100 text-sp-muted'}`}>
                    {bet.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
