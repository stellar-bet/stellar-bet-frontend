'use client';

import { useQuery } from '@tanstack/react-query';
import { liveApi } from '@/lib/api';

export default function LiveTicker() {
  const { data } = useQuery({
    queryKey: ['live-ticker'],
    queryFn: liveApi.all,
    refetchInterval: 20_000,
  });

  const live = data?.filter(m => m.status === 'LIVE') ?? [];
  if (live.length === 0) return null;

  const items = [...live, ...live];

  return (
    <div className="bg-sp-live overflow-hidden flex-none h-7 flex items-center"
      aria-label="Live scores ticker">
      <div className="flex items-center flex-none px-2 h-full bg-red-800 gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" aria-hidden="true" />
        <span className="text-white text-2xs font-black uppercase tracking-widest">Live</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-6 whitespace-nowrap px-3 h-full items-center"
          style={{ animation: 'ticker 30s linear infinite' }}>
          {items.map((m, i) => (
            <span key={`${m.id}-${i}`} className="flex items-center gap-1.5 text-white text-xs">
              <span aria-hidden="true">{m.sportIcon}</span>
              <span className="font-medium">{m.homeTeam}</span>
              <span className="font-black bg-red-800 px-1 rounded">{m.homeScore}–{m.awayScore}</span>
              <span className="font-medium">{m.awayTeam}</span>
              <span className="text-red-200 text-2xs">{m.minute}'</span>
              <span className="text-white/30">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
