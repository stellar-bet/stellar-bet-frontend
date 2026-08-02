'use client';

import { cn } from '@/lib/utils';
import { SPORT_LABELS, SPORT_ICONS } from '@/lib/constants';

interface SportFilterProps {
  selected: string;
  onSelect: (sport: string) => void;
}

const SPORTS = Object.keys(SPORT_LABELS);

export default function SportFilter({ selected, onSelect }: SportFilterProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Filter by sport"
    >
      {SPORTS.map((sport) => (
        <button
          key={sport}
          role="tab"
          aria-selected={selected === sport}
          onClick={() => onSelect(sport)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
            selected === sport
              ? 'bg-accent/20 text-accent border border-accent/40'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
          )}
        >
          <span aria-hidden="true">{SPORT_ICONS[sport]}</span>
          {SPORT_LABELS[sport]}
        </button>
      ))}
    </div>
  );
}
