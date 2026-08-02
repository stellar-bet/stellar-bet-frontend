'use client';

import { useQuery } from '@tanstack/react-query';
import { marketsApi } from '@/lib/api';
import MarketCard from './MarketCard';
import Skeleton from '@/components/ui/Skeleton';

interface MarketListProps {
  sport: string;
}

export default function MarketList({ sport }: MarketListProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['live-odds', sport],
    queryFn: () => marketsApi.liveOdds(sport),
    refetchInterval: 60_000, // refresh every 60s
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading markets">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <p className="text-gray-400 mb-4">Failed to load markets.</p>
        <button
          onClick={() => refetch()}
          className="text-accent hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-3" aria-hidden="true">📭</p>
        <p className="text-gray-400">No upcoming markets for this sport right now.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((market) => (
        <MarketCard key={market.externalEventId} market={market} />
      ))}
    </div>
  );
}
