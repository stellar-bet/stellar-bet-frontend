/**
 * Odds format converter.
 * All internal odds are stored as basis points (oddsBps).
 * e.g. 20000 bps = 2.00 decimal = 1/1 fractional = +100 american
 */

export type OddsFormat = 'decimal' | 'fractional' | 'american';

/** Convert bps to decimal odds */
export function bpsToDecimal(bps: number): number {
  return bps / 10_000;
}

/** Convert bps to fractional string e.g. "1/1", "5/2", "11/4" */
export function bpsToFractional(bps: number): string {
  const decimal = bpsToDecimal(bps);
  const numerator = decimal - 1;
  if (numerator <= 0) return '0/1';

  // Find simplest fraction via GCD
  const precision = 100;
  const n = Math.round(numerator * precision);
  const d = precision;
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}

/** Convert bps to American odds e.g. "+150", "-200" */
export function bpsToAmerican(bps: number): string {
  const decimal = bpsToDecimal(bps);
  if (decimal >= 2) {
    const american = Math.round((decimal - 1) * 100);
    return `+${american}`;
  } else {
    const american = Math.round(-100 / (decimal - 1));
    return `${american}`;
  }
}

/** Format odds in any format from bps */
export function formatOdds(bps: number, format: OddsFormat): string {
  switch (format) {
    case 'decimal':    return `${bpsToDecimal(bps).toFixed(2)}`;
    case 'fractional': return bpsToFractional(bps);
    case 'american':   return bpsToAmerican(bps);
  }
}

/** Label for each format */
export const ODDS_FORMAT_LABELS: Record<OddsFormat, string> = {
  decimal:    'Decimal',
  fractional: 'Fractional',
  american:   'American',
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Calculate potential payout from stake and odds bps */
export function calcPayoutFromBps(stakeXlm: number, oddsBps: number): number {
  return (stakeXlm * oddsBps) / 10_000;
}

/** Implied probability from bps */
export function impliedProbability(oddsBps: number): string {
  const decimal = bpsToDecimal(oddsBps);
  return `${((1 / decimal) * 100).toFixed(1)}%`;
}
