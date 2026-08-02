import { Bet } from '@/lib/api';
import { stroopsToXlm, bpsToOddsLabel } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

type BadgeVariant = 'win' | 'loss' | 'pending' | 'open' | 'cancelled' | 'default';

const STATUS_BADGE: Record<string, BadgeVariant> = {
  Open: 'open',
  Won: 'win',
  Lost: 'loss',
  Cancelled: 'cancelled',
  PendingSettlement: 'pending',
};

interface BetHistoryRowProps {
  bet: Bet;
}

export default function BetHistoryRow({ bet }: BetHistoryRowProps) {
  const stakeXlm = stroopsToXlm(BigInt(bet.stake_xlm));
  const payoutXlm = stroopsToXlm(BigInt(bet.potential_payout));
  const badgeVariant = STATUS_BADGE[bet.status] ?? 'default';

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      <td className="py-3 px-4">
        <span className="font-mono text-xs text-gray-400">#{bet.id}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-300">Market #{bet.market_id}</span>
        <span className="text-xs text-gray-600 ml-2">Outcome {bet.outcome_index}</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-white">{stakeXlm} XLM</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-accent">{bpsToOddsLabel(bet.odds_bps)}</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`text-sm ${bet.status === 'Won' ? 'text-win' : 'text-gray-400'}`}>
          {payoutXlm} XLM
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <Badge variant={badgeVariant}>{bet.status}</Badge>
      </td>
    </tr>
  );
}
