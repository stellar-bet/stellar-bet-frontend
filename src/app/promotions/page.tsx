'use client';

import Link from 'next/link';

const PROMOS = [
  {
    id:'p1', icon:'🎁', badge:'WELCOME BONUS', badgeBg:'#00a651',
    title:'200% Welcome Bonus', highlight:'Up to 200 XLM',
    desc:'Register today and get 200% bonus on your first deposit. Place bets on any football match to clear the bonus.',
    cta:'Register Now', ctaHref:'/register',
    terms:['New accounts only','Min deposit 10 XLM','Bonus valid 7 days','Testnet only — no real funds'],
    bg:'#e8f5ee', border:'#00a651',
  },
  {
    id:'p2', icon:'⚽', badge:'WEEKEND BOOST', badgeBg:'#1565c0',
    title:'Enhanced Odds Every Weekend', highlight:'Up to 5.00x',
    desc:'Get boosted odds on selected EPL and AFCON matches every Saturday and Sunday. Highlighted with a flame icon in the match list.',
    cta:'View Matches', ctaHref:'/sports',
    terms:['One boosted bet per user per week','Max stake 50 XLM','Selected matches only'],
    bg:'#e3f2fd', border:'#1565c0',
  },
  {
    id:'p3', icon:'✈️', badge:'AVIATOR CASHBACK', badgeBg:'#e65100',
    title:'10% Cashback on Aviator', highlight:'10% Weekly',
    desc:'Play Aviator every week and get 10% of your net losses back as bonus XLM. Credited every Monday automatically.',
    cta:'Play Aviator', ctaHref:'/aviator',
    terms:['Min 10 rounds played','Max cashback 50 XLM per week','Testnet only'],
    bg:'#fff3e0', border:'#e65100',
  },
  {
    id:'p4', icon:'🎯', badge:'ACCA BOOST', badgeBg:'#6a1b9a',
    title:'+10% on All Accumulators', highlight:'+10% on wins',
    desc:'Build an accumulator with 4 or more selections and we add an extra 10% to your payout when it wins. Applied automatically.',
    cta:'Build Acca', ctaHref:'/sports',
    terms:['Min 4 selections','Min odds 1.30 per selection','Max boost 200 XLM'],
    bg:'#f3e5f5', border:'#6a1b9a',
  },
  {
    id:'p5', icon:'💧', badge:'LIQUIDITY REWARDS', badgeBg:'#00838f',
    title:'Earn BET Tokens as LP', highlight:'Ongoing rewards',
    desc:'Provide XLM liquidity to back the house pool and earn BET governance tokens on top of your share of protocol fees.',
    cta:'Start Earning', ctaHref:'/liquidity',
    terms:['Min deposit 100 XLM','BET tokens distributed weekly','Testnet only'],
    bg:'#e0f7fa', border:'#00838f',
  },
  {
    id:'p6', icon:'🌍', badge:'AFCON JACKPOT', badgeBg:'#2e7d32',
    title:'AFCON Correct Score Jackpot', highlight:'Jackpot pool',
    desc:'Predict the correct score for all 5 AFCON matches in a day and win the entire jackpot pool. One entry per user per day.',
    cta:'Enter Now', ctaHref:'/sports?sport=afcon',
    terms:['Must predict all 5 scores exactly','One entry per day','Jackpot split between winners'],
    bg:'#e8f5e9', border:'#2e7d32',
  },
];

export default function PromotionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 py-5">

      {/* Page header */}
      <div className="section-header rounded-t mb-0">
        🎁 Promotions &amp; Bonuses
      </div>

      <div className="bg-white border border-sp-border border-t-0 rounded-b p-5 mb-4 shadow-sm">
        <p className="text-sp-muted text-sm">
          Exclusive offers for StellarBet users. All promotions run on Stellar Testnet — no real funds involved.
        </p>
      </div>

      {/* Promos grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROMOS.map(p => (
          <div key={p.id} className="rounded-lg overflow-hidden shadow-sm border"
            style={{ borderColor: p.border, background: p.bg }}>

            {/* Top color bar */}
            <div className="h-1.5" style={{ background: p.badgeBg }} />

            <div className="p-4">
              {/* Badge + icon */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black px-2.5 py-1 rounded text-white"
                  style={{ background: p.badgeBg }}>
                  {p.badge}
                </span>
                <span className="text-3xl">{p.icon}</span>
              </div>

              {/* Highlight */}
              <p className="text-2xl font-black mb-1" style={{ color: p.badgeBg }}>{p.highlight}</p>

              {/* Title + desc */}
              <h2 className="text-base font-bold text-sp-text mb-2">{p.title}</h2>
              <p className="text-sm text-sp-muted mb-4 leading-relaxed">{p.desc}</p>

              {/* CTA */}
              <Link href={p.ctaHref}
                className="inline-block font-bold text-sm px-5 py-2.5 rounded text-white transition-all hover:opacity-90"
                style={{ background: p.badgeBg }}>
                {p.cta} →
              </Link>
            </div>

            {/* Terms */}
            <div className="px-4 py-3 bg-white/60 border-t" style={{ borderColor: p.border + '40' }}>
              <p className="text-2xs text-sp-muted font-bold mb-1">Terms apply:</p>
              <ul className="text-2xs text-sp-muted space-y-0.5">
                {p.terms.map((t,i) => <li key={i}>· {t}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-700 text-sm font-bold mb-1">⚠️ Testnet Disclaimer</p>
        <p className="text-yellow-600 text-xs">
          All promotions are for demonstration purposes only. StellarBet runs on Stellar Testnet.
          No real XLM or monetary value is involved.
        </p>
      </div>
    </div>
  );
}
