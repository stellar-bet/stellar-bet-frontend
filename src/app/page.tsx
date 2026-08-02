'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import HeroCarousel from '@/components/home/HeroCarousel';
import LiveWatchSection from '@/components/live/LiveWatchSection';
import AccumSlip from '@/components/schedule/AccumSlip';
import { useAccumStore } from '@/store/accumStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds } from '@/lib/odds';
import { cn } from '@/lib/utils';
import { FullMatch } from '@/lib/api';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function HomePage() {
  const { selections, addSelection, removeSelection, hasSelection } = useAccumStore();
  const { format } = useOddsStore();

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/schedule/featured`);
      const json = await res.json() as { success: boolean; data: FullMatch[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });

  function pickFeatured(match: FullMatch, outcomeId: string, outcomeLabel: string, oddsBps: number) {
    if (hasSelection(match.id, outcomeId)) { removeSelection(match.id, outcomeId); return; }
    const prev = selections.find(s => s.matchId === match.id);
    if (prev) removeSelection(match.id, prev.outcomeId);
    addSelection({
      matchId: match.id,
      matchDesc: `${match.homeTeam} vs ${match.awayTeam}`,
      competition: match.competition,
      marketType: '1x2', marketLabel: 'Match Result',
      outcomeId, outcomeLabel, oddsBps,
    });
    toast.success(`Added: ${match.homeTeam} vs ${match.awayTeam} — ${outcomeLabel}`, {
      style: { background: '#00a651', color: '#fff', fontSize: '12px' },
    });
  }

  return (
    <div className="flex">
      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">

        {/* 1. Hero Carousel — SportyBet promo banners */}
        <HeroCarousel />

        {/* 2. Quick sport tabs */}
        <div className="bg-white border-b border-sp-border shadow-sm">
          <div className="flex overflow-x-auto scrollbar-none max-w-[1400px] mx-auto">
            {[
              { href: '/sports',                        icon: '⚽', label: 'Football' },
              { href: '/live',                          icon: '🔴', label: 'Live' },
              { href: '/sports?sport=champions_league', icon: '🏆', label: 'UCL' },
              { href: '/sports?sport=premier_league',   icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', label: 'EPL' },
              { href: '/sports?sport=afcon',            icon: '🌍', label: 'AFCON' },
              { href: '/sports?sport=la_liga',          icon: '🇪🇸', label: 'La Liga' },
              { href: '/virtuals',                      icon: '⚡', label: 'Virtuals' },
              { href: '/games',                         icon: '🎮', label: 'Casino' },
              { href: '/aviator',                       icon: '✈️', label: 'Aviator' },
              { href: '/promotions',                    icon: '🎁', label: 'Promos' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-1 py-2.5 px-4 min-w-[68px]
                           hover:bg-sp-green3 hover:text-sp-green border-r border-sp-border
                           text-sp-muted transition-colors last:border-0">
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <span className="text-2xs font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Watch & Bet Live section — THE KEY FEATURE */}
        <LiveWatchSection />

        {/* 4. Featured matches table — SportyBet style */}
        {featured && featured.length > 0 && (
          <section className="mt-2 mx-2">
            <div className="section-header rounded-t">
              ⭐ Featured Matches Today
              <Link href="/sports" className="ml-auto text-white/80 hover:text-white text-xs font-medium">
                All matches →
              </Link>
            </div>
            {/* Column labels */}
            <div className="flex items-center px-3 py-1.5 bg-gray-100 border-x border-sp-border">
              <div className="w-14 flex-none" />
              <div className="flex-1 text-2xs text-sp-muted font-bold uppercase px-2">Match</div>
              <div className="flex gap-1 flex-none mr-8">
                {['1', 'X', '2'].map(l => (
                  <span key={l} className="text-2xs text-sp-muted font-bold w-[60px] text-center">{l}</span>
                ))}
              </div>
            </div>
            {/* Rows */}
            <div className="border border-sp-border border-t-0 rounded-b overflow-hidden">
              {featured.slice(0, 8).map((match, idx) => {
                const mkt = match.markets.find(m => m.type === '1x2') ?? match.markets[0];
                const kickoff = new Date(match.kickoff).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit',
                });
                const selId = selections.find(s => s.matchId === match.id)?.outcomeId;
                return (
                  <div key={match.id}
                    className={cn(
                      'flex items-center px-3 py-2 border-b border-sp-border last:border-0 transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-sp-row',
                      'hover:bg-sp-green3'
                    )}>
                    <div className="w-14 flex-none text-center">
                      <p className="text-xs font-mono text-sp-muted leading-tight">{kickoff}</p>
                      <p className="text-base leading-tight">{match.competitionIcon}</p>
                    </div>
                    <Link href={`/match/${match.id}`}
                      className="flex-1 min-w-0 px-2 hover:text-sp-green transition-colors">
                      <p className="text-sm font-medium text-sp-text truncate">{match.homeTeam}</p>
                      <p className="text-sm font-medium text-sp-text truncate mt-0.5">{match.awayTeam}</p>
                    </Link>
                    <div className="flex gap-1 flex-none mr-2">
                      {mkt.outcomes.slice(0, 3).map(o => {
                        const isSel = selId === o.id;
                        return (
                          <button key={o.id}
                            onClick={() => pickFeatured(match, o.id, o.label, o.oddsBps)}
                            aria-pressed={isSel}
                            className={cn('odds-btn', isSel && 'odds-btn-selected')}>
                            <span className="odds-btn-label">{o.label}</span>
                            <span className="odds-btn-value">{formatOdds(o.oddsBps, format)}</span>
                          </button>
                        );
                      })}
                    </div>
                    <Link href={`/match/${match.id}`}
                      className="text-2xs text-sp-muted hover:text-sp-green border border-sp-border
                                 rounded px-1.5 py-1 ml-1 flex-none hover:border-sp-green transition-colors">
                      +{match.markets.length - 1}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Casino games strip */}
        <section className="mt-2 mx-2 mb-2">
          <div className="section-header rounded-t">
            🎮 Casino Games
            <Link href="/games" className="ml-auto text-white/80 hover:text-white text-xs font-medium">All →</Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 border border-sp-border border-t-0 rounded-b overflow-hidden">
            {[
              { href: '/aviator',      icon: '✈️', label: 'Aviator',  hot: true },
              { href: '/games/mines',  icon: '💣', label: 'Mines',    hot: false },
              { href: '/games/plinko', icon: '🔵', label: 'Plinko',   hot: false },
              { href: '/games/dice',   icon: '🎲', label: 'Dice',     hot: false },
              { href: '/games/hilo',   icon: '🃏', label: 'HiLo',     hot: false },
              { href: '/games/wheel',  icon: '🎡', label: 'Wheel',    hot: false },
              { href: '/games/keno',   icon: '🎱', label: 'Keno',     hot: false },
              { href: '/games/limbo',  icon: '🚀', label: 'Limbo',    hot: false },
            ].map(g => (
              <Link key={g.href} href={g.href}
                className="relative flex flex-col items-center gap-1 py-4 bg-white
                           hover:bg-sp-green3 border-r border-sp-border last:border-0 transition-colors">
                {g.hot && (
                  <span className="absolute top-1 right-1 text-2xs bg-sp-live text-white
                                   px-1 py-0.5 rounded font-black leading-none">HOT</span>
                )}
                <span className="text-3xl" aria-hidden="true">{g.icon}</span>
                <span className="text-xs text-sp-muted font-medium">{g.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Virtual sports strip */}
        <section className="mt-0 mx-2 mb-4">
          <div className="section-header rounded-t">
            ⚡ Virtual Sports
            <Link href="/virtuals" className="ml-auto text-white/80 hover:text-white text-xs font-medium">Play →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-sp-border border-t-0 rounded-b overflow-hidden">
            {[
              { icon: '⚽', name: 'Virtual Football',   sub: 'Every 3 mins' },
              { icon: '🏀', name: 'Virtual Basketball', sub: 'Every 2 mins' },
              { icon: '🐎', name: 'Virtual Horses',     sub: 'Every 90 secs' },
              { icon: '🐕', name: 'Virtual Greyhounds', sub: 'Every 60 secs' },
            ].map((v, i) => (
              <Link key={i} href="/virtuals"
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-sp-green3
                           border-r border-sp-border last:border-0 transition-colors">
                <span className="text-3xl flex-none" aria-hidden="true">{v.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-sp-text">{v.name}</p>
                  <p className="text-xs text-sp-green font-medium">{v.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bet slip sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 border-l border-sp-border bg-white flex-none shadow-lg"
        style={{ position: 'sticky', top: 0, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
        <AccumSlip />
      </aside>

      {/* Mobile slip */}
      {selections.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 max-h-[72vh] overflow-y-auto
                        bg-white border-t-2 border-sp-green z-40 shadow-2xl animate-slide-up">
          <AccumSlip />
        </div>
      )}
    </div>
  );
}
