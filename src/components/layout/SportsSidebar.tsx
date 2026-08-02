'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const SPORTS = [
  { icon: '⚽', label: 'Football',   key: 'soccer' },
  { icon: '🏀', label: 'Basketball', key: 'nba' },
  { icon: '🎾', label: 'Tennis',     key: 'atp_wimbledon' },
  { icon: '🏈', label: 'NFL',        key: 'nfl' },
  { icon: '🥊', label: 'MMA',        key: 'ufc' },
  { icon: '🏏', label: 'Cricket',    key: 'icc_world_cup' },
  { icon: '🎮', label: 'Casino',     key: 'games',     href: '/games' },
  { icon: '✈️', label: 'Aviator',    key: 'aviator',   href: '/aviator' },
  { icon: '⚡', label: 'Virtuals',   key: 'virtuals',  href: '/virtuals' },
  { icon: '🔴', label: 'Live',       key: 'live',      href: '/live' },
  { icon: '🎁', label: 'Promos',     key: 'promos',    href: '/promotions' },
];

export default function SportsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sportParam = searchParams.get('sport');

  return (
    <aside className="w-[68px] flex-none bg-white border-r border-sp-border flex-col
                      overflow-y-auto scrollbar-none hidden lg:flex shadow-sm"
      aria-label="Sport categories">
      {SPORTS.map(sport => {
        const href = sport.href ?? `/sports?sport=${sport.key}`;
        const isActive = sport.href
          ? pathname === sport.href
          : (pathname === '/sports' && (sportParam === sport.key || (!sportParam && sport.key === 'soccer')));
        return (
          <Link key={sport.key} href={href} aria-label={sport.label}
            className={cn('sport-item', isActive && 'sport-item-active')}>
            <span className="text-2xl leading-none mb-0.5" aria-hidden="true">{sport.icon}</span>
            <span>{sport.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
