'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, shortenAddress } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useUserStore, AVATAR_ICONS } from '@/store/userStore';
import { useOddsStore } from '@/store/oddsStore';
import { OddsFormat, ODDS_FORMAT_LABELS } from '@/lib/odds';
import Button from '@/components/ui/Button';
import { STELLAR_NETWORK } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/sports',      label: 'Sports' },
  { href: '/live',        label: '🔴 Live' },
  { href: '/virtuals',    label: 'Virtuals' },
  { href: '/games',       label: '🎮 Games' },
  { href: '/aviator',     label: '✈️ Aviator' },
  { href: '/promotions',  label: '🎁 Promos' },
  { href: '/my-bets',     label: 'My Bets' },
  { href: '/liquidity',   label: 'Earn' },
];

const MOBILE_NAV = [
  { href: '/sports',   label: 'Sports',   icon: '⚽' },
  { href: '/live',     label: 'Live',     icon: '🔴' },
  { href: '/games',    label: 'Games',    icon: '🎮' },
  { href: '/aviator',  label: 'Aviator',  icon: '✈️' },
  { href: '/account',  label: 'Account',  icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletStore();
  const { profile } = useUserStore();
  const { format, setFormat } = useOddsStore();

  const FORMATS: OddsFormat[] = ['decimal', 'fractional', 'american'];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-brand-900/80 backdrop-blur-xl">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-none" aria-label="StellarBet home">
          <span className="text-2xl" aria-hidden="true">⭐</span>
          <span className="font-bold text-white text-lg tracking-tight">
            Stellar<span className="text-accent">Bet</span>
          </span>
          {STELLAR_NETWORK === 'testnet' && (
            <span className="hidden sm:inline text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/30">
              Testnet
            </span>
          )}
        </Link>

        {/* Nav links — desktop */}
        <ul className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  pathname === link.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-none">

          {/* Odds format switcher */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5"
            role="group" aria-label="Odds format">
            {FORMATS.map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                title={ODDS_FORMAT_LABELS[f]}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-semibold transition-all',
                  format === f
                    ? 'bg-accent text-brand-900'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {f === 'decimal' ? 'Dec' : f === 'fractional' ? 'Frac' : 'US'}
              </button>
            ))}
          </div>

          {/* Account / wallet */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              {profile?.isRegistered ? (
                <Link href="/account"
                  className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="My account"
                >
                  <span className="text-lg leading-none" aria-hidden="true">{AVATAR_ICONS[profile.avatar]}</span>
                  <span className="text-sm text-white font-medium">@{profile.username}</span>
                </Link>
              ) : (
                <Link href="/register"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors">
                  Register
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={disconnect} aria-label="Disconnect wallet">
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register"
                className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-2">
                Register
              </Link>
              <Button variant="primary" size="sm" loading={isConnecting} onClick={connect}
                aria-label="Connect Freighter wallet">
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-900/95 backdrop-blur-xl border-t border-white/10"
        aria-label="Mobile navigation">
        <div className="flex">
          {MOBILE_NAV.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                pathname === link.href ? 'text-accent' : 'text-gray-500'
              )}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <span className="text-lg leading-none" aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
