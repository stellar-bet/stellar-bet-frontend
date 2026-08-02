/**
 * Shared utilities for instant casino games.
 * All RNG is client-side for the testnet demo.
 * In production these would be provably fair server-side results.
 */

/** House edge applied to all games (5%) */
export const HOUSE_EDGE = 0.05;

/** Apply house edge to a raw multiplier */
export function applyEdge(rawMultiplier: number): number {
  return Math.round(rawMultiplier * (1 - HOUSE_EDGE) * 100) / 100;
}

/** Format a multiplier for display */
export function fmtMultiplier(v: number): string {
  return `${v.toFixed(2)}x`;
}

/** Format XLM payout */
export function fmtPayout(stake: number, multiplier: number): string {
  return `${(stake * multiplier).toFixed(2)} XLM`;
}

/** Random integer between min and max inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Shuffle an array (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Mines: calculate multiplier for n safe tiles picked out of (25 - bombs) safe tiles */
export function minesMultiplier(picked: number, bombs: number): number {
  const safe = 25 - bombs;
  // Probability of picking `picked` safe tiles = product of (safe-i)/(25-i)
  let prob = 1;
  for (let i = 0; i < picked; i++) {
    prob *= (safe - i) / (25 - i);
  }
  return applyEdge(1 / prob);
}

/** Keno multipliers table (10-spot game) */
export const KENO_MULTIPLIERS: Record<number, Record<number, number>> = {
  1:  { 1: 3.96 },
  2:  { 1: 1.00, 2: 8.00 },
  3:  { 1: 0.50, 2: 3.00, 3: 30.0 },
  4:  { 1: 0.30, 2: 1.50, 3: 5.00, 4: 80.0 },
  5:  { 1: 0.00, 2: 1.00, 3: 3.00, 4: 20.0, 5: 200.0 },
  10: { 0: 0.00, 5: 1.50, 6: 4.00, 7: 20.0, 8: 100.0, 9: 500.0, 10: 2000.0 },
};

/** Wheel segments */
export const WHEEL_SEGMENTS = [
  { label: '1.5x',  multiplier: 1.5,  color: '#3ecf8e', weight: 30 },
  { label: '2x',    multiplier: 2,    color: '#f0b429', weight: 20 },
  { label: '3x',    multiplier: 3,    color: '#8b5cf6', weight: 12 },
  { label: '5x',    multiplier: 5,    color: '#ef4444', weight: 8  },
  { label: '10x',   multiplier: 10,   color: '#06b6d4', weight: 5  },
  { label: '0x',    multiplier: 0,    color: '#374151', weight: 15 },
  { label: '1x',    multiplier: 1,    color: '#6b7280', weight: 10 },
];

/** Pick a weighted random wheel segment */
export function spinWheel(): typeof WHEEL_SEGMENTS[0] {
  const total = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let r = Math.random() * total;
  for (const seg of WHEEL_SEGMENTS) {
    r -= seg.weight;
    if (r <= 0) return seg;
  }
  return WHEEL_SEGMENTS[0];
}

/** Card deck */
export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const;
export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

export interface PlayingCard {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14
  isRed: boolean;
}

export function buildDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({
        suit,
        rank: RANKS[i],
        value: i + 2,
        isRed: suit === '♥' || suit === '♦',
      });
    }
  }
  return shuffle(deck);
}

export function hiloMultiplier(
  currentValue: number,
  guess: 'higher' | 'lower' | 'equal'
): number {
  const total = 52;
  let favorable = 0;
  if (guess === 'higher') favorable = (14 - currentValue) * 4;
  else if (guess === 'lower') favorable = (currentValue - 2) * 4;
  else favorable = 4; // same value — 4 cards
  if (favorable === 0) return 0;
  return applyEdge(total / favorable);
}
