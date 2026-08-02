import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { STROOPS_PER_XLM } from './constants';

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Convert stroops (bigint) to XLM display string */
export function stroopsToXlm(stroops: bigint | number, decimals = 2): string {
  const val = Number(stroops) / Number(STROOPS_PER_XLM);
  return val.toFixed(decimals);
}

/** Convert XLM float to stroops bigint */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.floor(xlm * Number(STROOPS_PER_XLM)));
}

/** Convert basis points to decimal odds string, e.g. 20000 → "2.00x" */
export function bpsToOddsLabel(bps: number): string {
  return `${(bps / 10_000).toFixed(2)}x`;
}

/** Convert decimal odds to implied probability percentage */
export function oddsToImpliedProb(decimalOdds: number): string {
  return `${((1 / decimalOdds) * 100).toFixed(1)}%`;
}

/** Calculate potential payout in XLM */
export function calcPayout(stakeXlm: number, oddsBps: number): number {
  return (stakeXlm * oddsBps) / 10_000;
}

/** Shorten a Stellar address for display: GABCD...WXYZ */
export function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

/** Format a ledger number as approximate time (5s per ledger on Stellar) */
export function ledgerToApproxTime(
  currentLedger: number,
  targetLedger: number
): string {
  const diffLedgers = targetLedger - currentLedger;
  if (diffLedgers <= 0) return 'Closed';
  const seconds = diffLedgers * 5;
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

/** Format currency with XLM symbol */
export function formatXlm(xlm: number): string {
  return `${xlm.toFixed(2)} XLM`;
}
