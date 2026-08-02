'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAccumStore } from '@/store/accumStore';

const NAV = [
  { href: '/',        icon: '🏠', label: 'Home' },
  { href: '/sports',  icon: '⚽', label: 'Sports' },
  { href: '/live',    icon: '🔴', label: 'Live' },
  { href: '/my-bets', icon: '🎯', label: 'Bets' },
  { href: '/account', icon: '👤', label: 'Account' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { selections } = useAccumStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sp-border shadow-lg"
      aria-label="Mobile navigation">
      <div className="flex">
        {NAV.map(item => {
          const isActive = pathname === item.href;
          const badge = item.href === '/my-bets' && selections.length > 0;
          return (
            <Link key={item.href} href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative',
                isActive ? 'text-sp-green' : 'text-sp-muted hover:text-sp-green'
              )}>
              <span className="text-xl leading-none relative" aria-hidden="true">
                {item.icon}
                {badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-sp-live text-white
                                   text-2xs rounded-full flex items-center justify-center font-bold">
                    {selections.length}
                  </span>
                )}
              </span>
              <span className="text-2xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
