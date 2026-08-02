'use client';

import AviatorGame from '@/components/aviator/AviatorGame';

export default function AviatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 py-5">
      <div className="section-header rounded-t mb-0">
        <span className="w-2 h-2 rounded-full bg-white animate-live-pulse" aria-hidden="true" />
        ✈️ Aviator — Crash Game
        <span className="ml-auto bg-sp-yellow text-sp-text text-2xs font-black px-2 py-0.5 rounded">
          TESTNET DEMO
        </span>
      </div>
      <div className="bg-white border border-sp-border border-t-0 rounded-b px-4 py-3 mb-4 shadow-sm">
        <p className="text-sm text-sp-muted">
          Cash out before the plane flies away. Place your bet, watch the multiplier climb, and cash out at the right moment to win big.
        </p>
      </div>
      <AviatorGame />
    </div>
  );
}
