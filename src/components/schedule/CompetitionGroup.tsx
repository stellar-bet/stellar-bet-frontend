'use client';

import { useState } from 'react';
import { FullMatch } from '@/lib/api';
import MatchRow from './MatchRow';
import { cn } from '@/lib/utils';

interface Props {
  competition: string;
  icon: string;
  country: string;
  matches: FullMatch[];
  defaultOpen?: boolean;
}

export default function CompetitionGroup({ competition, icon, country, matches, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1 rounded overflow-hidden shadow-sm border border-sp-border">
      {/* Competition header — green left border like SportyBet */}
      <button onClick={() => setOpen(o => !o)}
        className="comp-header w-full" aria-expanded={open}>
        <span className="text-lg" aria-hidden="true">{icon}</span>
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-bold text-sp-text">{competition}</span>
          <span className="text-xs text-sp-muted ml-2">{country}</span>
        </div>
        <span className="text-xs text-sp-muted bg-white px-2 py-0.5 rounded-full border border-sp-border">
          {matches.length}
        </span>
        <span className={cn('text-xs text-sp-muted ml-2 transition-transform', open && 'rotate-180')}
          aria-hidden="true">▼</span>
      </button>

      {/* Column headers */}
      {open && (
        <div>
          <div className="flex items-center px-3 py-1 bg-gray-100 border-b border-sp-border">
            <div className="w-10 flex-none" />
            <div className="flex-1 text-2xs text-sp-muted uppercase tracking-wide px-2">Match</div>
            <div className="flex gap-1 flex-none mr-8">
              {['1', 'X', '2'].map(l => (
                <span key={l} className="text-2xs text-sp-muted font-bold w-[60px] text-center">{l}</span>
              ))}
            </div>
          </div>
          {matches.map(m => <MatchRow key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
