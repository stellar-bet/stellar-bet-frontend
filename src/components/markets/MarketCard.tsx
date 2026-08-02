'use client';

import { NormalizedMarket } from '@/lib/api';
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/constants';
import { useBetSlipStore } from '@/store/betSlipStore';
import { useOddsStore } from '@/store/oddsStore';
import { formatOdds, impliedProbability } from '@/lib/odds';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface MarketCardProps {
  market: NormalizedMarket;
}

export default function MarketCard({ market }: MarketCardProps) {
  const addToBetSlip = useBetSlipStore((s) => s.addToBetSlip);
  const currentItem = useBetSlipStore((s) => s.item);
  const { format } = useOddsStore();

  function selectOutcome(outcomeIndex: number) {
    const outcome = market.outcomes[outcomeIndex];
    if (!outcome) return;
    addToBetSlip({
      marketId: market.externalEventId,
      externalEventId: market.externalEventId,
      description: market.description,
      sport: market.sportKey,
      outcomeName: outcome.name,
      outcomeIndex,
      oddsBps: outcome.oddsBps,
      decimalOdds: outcome.avgDecimalOdds,
    });
    toast.success(`${outcome.name} added to bet slip`, { duration: 2000 });
  }

  const commenceDate = new Date(market.commenceTime);
  const isLive = commenceDate <= new Date();

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span aria-hidden="true" className="text-sm">{SPORT_ICONS[market.sportKey] ?? '🏟️'}</span>
            <span className="text-xs text-gray-500">{SPORT_LABELS[market.sportKey] ?? market.sportKey}</span>
            {isLive && (
              <Badge variant="pending">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-pending mr-1 animate-pulse-fast" aria-hidden="true" />
                Live
              </Badge>
            )}
          </div>
          <h3 className="text-white font-medium text-sm leading-snug">{market.description}</h3>
        </div>
        <time dateTime={market.commenceTime} className="text-xs text-gray-500 text-right whitespace-nowrap ml-2">
          {commenceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(market.outcomes.length, 3)}, 1fr)` }}
        role="group"
        aria-label={`Outcomes for ${market.description}`}
      >
        {market.outcomes.map((outcome, idx) => {
          const isSelected =
            currentItem?.externalEventId === market.externalEventId &&
            currentItem.outcomeIndex === idx;
          return (
            <button
              key={outcome.name}
              onClick={() => selectOutcome(idx)}
              aria-pressed={isSelected}
              aria-label={`Bet on ${outcome.name} at ${formatOdds(outcome.oddsBps, format)}`}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border
                transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
                ${isSelected
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}`}
            >
              <span className="text-xs text-gray-400 mb-0.5 truncate w-full text-center">{outcome.name}</span>
              <span className="text-base font-bold tabular-nums">{formatOdds(outcome.oddsBps, format)}</span>
              <span className="text-xs text-gray-500 mt-0.5">{impliedProbability(outcome.oddsBps)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
