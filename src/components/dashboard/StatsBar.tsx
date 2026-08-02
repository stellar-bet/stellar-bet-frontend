'use client';

import { useQuery } from '@tanstack/react-query';
import { betsApi, liquidityApi } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';

interface StatProps {
  label: string;
  value: string;
  sub?: string;
}

function Stat({ label, value, sub }: StatProps) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-xl font-bold text-white mt-0.5">{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

export default function StatsBar() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: betsApi.globalStats,
    staleTime: 30_000,
  });

  const { data: pool, isLoading: poolLoading } = useQuery({
    queryKey: ['pool-stats'],
    queryFn: liquidityApi.stats,
    staleTime: 30_000,
  });

  if (statsLoading || poolLoading) {
    return (
      <div className="flex gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-28" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-6 sm:gap-10"
      aria-label="Platform statistics"
    >
      <Stat
        label="Total Bets"
        value={stats?.totalBets ?? '—'}
      />
      <Stat
        label="Open Markets"
        value={stats?.totalMarkets ?? '—'}
      />
      <Stat
        label="Liquidity Pool"
        value={pool ? `${pool.totalLiquidityXlm.toLocaleString()} XLM` : '—'}
        sub={pool ? `${pool.feePercent}% fee` : undefined}
      />
    </div>
  );
}
