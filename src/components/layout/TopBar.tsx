'use client';

import Link from 'next/link';
import { useWalletStore } from '@/store/walletStore';
import { useUserStore, AVATAR_ICONS } from '@/store/userStore';
import { useOddsStore } from '@/store/oddsStore';
import { OddsFormat } from '@/lib/odds';
import { shortenAddress, cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const { address, isConnected, isConnecting, connect } = useWalletStore();
  const { profile } = useUserStore();
  const { format, setFormat } = useOddsStore();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const FORMATS: OddsFormat[] = ['decimal', 'fractional', 'american'];
  const FMT: Record<OddsFormat, string> = { decimal: 'Dec', fractional: 'Frac', american: 'US' };

  return (
    <header className="sticky top-0 z-50 flex-none shadow-md" style={{ background: '#00a651' }}>
      {/* Main header row */}
      <div className="flex items-center h-12 px-3 gap-3 max-w-[1400px] mx-auto">

        {/* Logo — SportyBet style: bold white text on green */}
        <Link href="/" className="flex items-center gap-2 flex-none" aria-label="StellarBet">
          <div className="flex items-center">
            <span className="font-black text-white text-xl tracking-tight leading-none">
              STELLAR
            </span>
            <span className="font-black text-sp-yellow text-xl tracking-tight leading-none ml-0.5">
              BET
            </span>
          </div>
          <span className="text-2xs bg-white/20 text-white px-1.5 py-0.5 rounded font-bold hidden sm:block border border-white/30">
            TESTNET
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search teams or leagues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search.trim() && router.push(`/sports?q=${encodeURIComponent(search)}`)}
              className="w-full bg-white border-0 rounded pl-8 pr-3 py-1.5 text-sp-text text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main">
          {[
            ['/sports',     '⚽ Sports'],
            ['/live',       '🔴 Live'],
            ['/virtuals',   '⚡ Virtuals'],
            ['/games',      '🎮 Casino'],
            ['/aviator',    '✈️ Aviator'],
            ['/promotions', '🎁 Promos'],
          ].map(([href, label]) => (
            <Link key={href} href={href}
              className="px-3 py-1.5 rounded text-sm text-white hover:bg-white/20 transition-colors whitespace-nowrap font-medium">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-none ml-auto">

          {/* Odds format switcher */}
          <div className="hidden md:flex items-center bg-white/10 rounded overflow-hidden border border-white/20"
            role="group" aria-label="Odds format">
            {FORMATS.map(f => (
              <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
                className={cn('px-2 py-1 text-xs font-bold transition-all',
                  format === f ? 'bg-white text-sp-green' : 'text-white hover:bg-white/20')}>
                {FMT[f]}
              </button>
            ))}
          </div>

          {/* Wallet / Login */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <Link href="/account"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20
                           rounded px-2.5 py-1.5 text-white text-xs font-medium transition-colors">
                {profile && <span aria-hidden="true">{AVATAR_ICONS[profile.avatar]}</span>}
                <span className="font-mono hidden sm:block">{shortenAddress(address)}</span>
              </Link>
              <Link href="/liquidity"
                className="bg-white text-sp-green text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
                Deposit
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register"
                className="text-white text-sm font-medium hover:text-white/80 transition-colors hidden sm:block">
                Register
              </Link>
              <button onClick={connect} disabled={isConnecting}
                className="bg-white text-sp-green text-sm font-bold px-4 py-1.5 rounded
                           hover:bg-gray-100 disabled:opacity-60 transition-colors">
                {isConnecting ? '...' : 'Login'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-nav row — sport tabs like SportyBet */}
      <div className="border-t border-white/20" style={{ background: '#007a3d' }}>
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-[1400px] mx-auto">
          {[
            ['all',              '🏟', 'All Sports'],
            ['premier_league',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'EPL'],
            ['champions_league', '🏆', 'UCL'],
            ['afcon',            '🌍', 'AFCON'],
            ['la_liga',          '🇪🇸', 'La Liga'],
            ['serie_a',          '🇮🇹', 'Serie A'],
            ['bundesliga',       '🇩🇪', 'Bundesliga'],
            ['ligue_1',          '🇫🇷', 'Ligue 1'],
            ['nba',              '🏀', 'NBA'],
            ['nfl',              '🏈', 'NFL'],
            ['ufc',              '🥊', 'UFC'],
          ].map(([key, icon, label]) => (
            <Link key={key} href={`/sports?sport=${key}`}
              className="flex items-center gap-1.5 px-4 py-2 text-white/80 hover:text-white
                         hover:bg-white/10 text-xs font-medium whitespace-nowrap transition-colors
                         border-r border-white/10 last:border-0">
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
