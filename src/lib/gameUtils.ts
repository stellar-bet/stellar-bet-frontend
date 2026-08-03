/**
 * Shared utilities for instant casino games.
 *
 * RNG model:
 *   - All games use provably fair server seeds via the commit-reveal API.
 *   - The server generates a serverSeed and returns sha256(serverSeed) as a commitment.
 *   - After the bet is locked the server reveals the serverSeed.
 *   - Results are derived from HMAC-SHA256(serverSeed, clientSeed:nonce).
 *   - Each game has a seed-based result function (suffix "FromFloat" / "FromFloats")
 *     that accepts pre-derived floats in [0,1) so the result is fully deterministic
 *     and independently verifiable.
 *
 * The raw Math.random() helpers (randInt, shuffle) are kept for non-bet UI
 * animations only (e.g. Plinko ball path visual, Keno reveal order).
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

// ─── UI-only RNG (not used for bet outcomes) ─────────────────────────────────

/** Random integer between min and max inclusive — UI animations only */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Shuffle an array (Fisher-Yates) — UI animations only */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Provably fair RNG helpers ────────────────────────────────────────────────

/**
 * Convert a hex resultBytes string from the server into an array of floats in [0,1).
 * Each 4-byte chunk → one float (same algorithm as the backend deriveFloats()).
 * Used by game pages to turn raw server bytes into usable random values.
 */
export function resultBytesToFloats(resultBytes: string, count: number): number[] {
  const floats: number[] = [];
  // Each float uses 4 bytes = 8 hex chars
  for (let i = 0; floats.length < count; i++) {
    const offset = (i * 8) % (resultBytes.length - 7);
    const chunk = resultBytes.slice(offset, offset + 8);
    const n = parseInt(chunk, 16);
    floats.push(n / 0x100000000);
  }
  return floats;
}

/**
 * Seeded integer in [min, max] from a float in [0,1).
 */
export function seededInt(float: number, min: number, max: number): number {
  return Math.floor(float * (max - min + 1)) + min;
}

/**
 * Seeded shuffle — deterministically reorder an array using a pool of floats.
 * Consumes arr.length floats from the provided floats array (starting at offset).
 */
export function seededShuffle<T>(arr: T[], floats: number[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(floats[a.length - 1 - i] * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Game result functions (provably fair) ────────────────────────────────────

/** Dice — returns rolled value 1-100 from a single float */
export function diceResultFromFloat(float: number): number {
  return Math.floor(float * 100) + 1;
}

/** Limbo — crash multiplier from a float, with house edge applied */
export function limboResultFromFloat(float: number): number {
  // Mirror the server Pareto-like distribution; clamp to [1.00, 1000]
  if (float >= 0.99) return 1.0; // ~1% chance of 1.00x (crash immediately)
  const raw = 1 / (1 - float * 0.99);
  return Math.min(1000, Math.round(raw * 100) / 100);
}

/** Aviator — crash point from a float */
export function aviatorCrashFromFloat(float: number): number {
  if (float < 0.05) return 1.0;
  const raw = Math.max(1.01, 1 / (1 - float * 0.99));
  return Math.round(raw * 100) / 100;
}

/** Wheel — segment index from a float */
export function wheelResultFromFloat(float: number): number {
  const total = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let r = float * total;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    r -= WHEEL_SEGMENTS[i].weight;
    if (r <= 0) return i;
  }
  return WHEEL_SEGMENTS.length - 1;
}

/** Plinko — bucket index (0–8) from a float using 8 rows of binary path */
export function plinkoBucketFromFloat(float: number): number {
  // Expand the float into 8 bits to simulate 8 left/right decisions
  const bits = Math.floor(float * 256); // 0-255 → 8 bits
  let pos = 0;
  for (let i = 0; i < 8; i++) {
    pos += (bits >> i) & 1;
  }
  return pos; // 0–8
}

/**
 * Mines — place bomb positions deterministically from floats.
 * Uses seededShuffle to assign bombs to the 25-tile grid.
 * Returns a 25-element array: true = bomb.
 */
export function minesGridFromFloats(bombs: number, floats: number[]): boolean[] {
  const indices = Array.from({ length: 25 }, (_, i) => i);
  const shuffled = seededShuffle(indices, floats);
  const bombSet = new Set(shuffled.slice(0, bombs));
  return Array.from({ length: 25 }, (_, i) => bombSet.has(i));
}

/**
 * Keno — draw 20 numbers from 1-40 deterministically from floats.
 */
export function kenoDrawFromFloats(floats: number[]): number[] {
  const pool = Array.from({ length: 40 }, (_, i) => i + 1);
  const shuffled = seededShuffle(pool, floats);
  return shuffled.slice(0, 20);
}

/**
 * HiLo — build a shuffled deck deterministically from floats.
 */
export function hiloDecodeFromFloats(floats: number[]): PlayingCard[] {
  return seededShuffle(buildDeck(), floats);
}

// ─── Mines multiplier ─────────────────────────────────────────────────────────

/** Mines: calculate multiplier for n safe tiles picked out of (25 - bombs) safe tiles */
export function minesMultiplier(picked: number, bombs: number): number {
  const safe = 25 - bombs;
  let prob = 1;
  for (let i = 0; i < picked; i++) {
    prob *= (safe - i) / (25 - i);
  }
  return applyEdge(1 / prob);
}

// ─── Keno multipliers table ───────────────────────────────────────────────────

export const KENO_MULTIPLIERS: Record<number, Record<number, number>> = {
  1:  { 1: 3.96 },
  2:  { 1: 1.00, 2: 8.00 },
  3:  { 1: 0.50, 2: 3.00, 3: 30.0 },
  4:  { 1: 0.30, 2: 1.50, 3: 5.00, 4: 80.0 },
  5:  { 1: 0.00, 2: 1.00, 3: 3.00, 4: 20.0, 5: 200.0 },
  10: { 0: 0.00, 5: 1.50, 6: 4.00, 7: 20.0, 8: 100.0, 9: 500.0, 10: 2000.0 },
};

// ─── Wheel segments ───────────────────────────────────────────────────────────

export const WHEEL_SEGMENTS = [
  { label: '1.5x',  multiplier: 1.5,  color: '#3ecf8e', weight: 30 },
  { label: '2x',    multiplier: 2,    color: '#f0b429', weight: 20 },
  { label: '3x',    multiplier: 3,    color: '#8b5cf6', weight: 12 },
  { label: '5x',    multiplier: 5,    color: '#ef4444', weight: 8  },
  { label: '10x',   multiplier: 10,   color: '#06b6d4', weight: 5  },
  { label: '0x',    multiplier: 0,    color: '#374151', weight: 15 },
  { label: '1x',    multiplier: 1,    color: '#6b7280', weight: 10 },
];

/** Pick a weighted random wheel segment — UI preview only, not used for bet outcomes */
export function spinWheel(): typeof WHEEL_SEGMENTS[0] {
  const total = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let r = Math.random() * total;
  for (const seg of WHEEL_SEGMENTS) {
    r -= seg.weight;
    if (r <= 0) return seg;
  }
  return WHEEL_SEGMENTS[0];
}

// ─── Card deck ────────────────────────────────────────────────────────────────

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
  return deck;
}

export function hiloMultiplier(
  currentValue: number,
  guess: 'higher' | 'lower' | 'equal'
): number {
  const total = 52;
  let favorable = 0;
  if (guess === 'higher') favorable = (14 - currentValue) * 4;
  else if (guess === 'lower') favorable = (currentValue - 2) * 4;
  else favorable = 4;
  if (favorable === 0) return 0;
  return applyEdge(total / favorable);
}
