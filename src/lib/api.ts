/**
 * API client — typed fetch wrappers for stellar-bet-backend.
 */

import { API_URL } from './constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BetStatus = 'Open' | 'Won' | 'Lost' | 'Cancelled' | 'PendingSettlement';

export interface Bet {
  id: string;
  bettor: string;
  market_id: string;
  outcome_index: number;
  stake_xlm: string;
  odds_bps: number;
  potential_payout: string;
  status: BetStatus;
  created_ledger: number;
  settled_ledger: number;
}

export interface Market {
  id: string;
  description: string;
  sport: string;
  outcome_count: number;
  total_pool: string;
  winning_outcome: number;
  is_open: boolean;
  start_ledger: number;
  close_ledger: number;
}

export interface NormalizedMarket {
  externalEventId: string;
  sportKey: string;
  description: string;
  commenceTime: string;
  outcomes: Array<{ name: string; avgDecimalOdds: number; oddsBps: number }>;
}

export interface PoolStats {
  totalLiquidityXlm: number;
  totalFeesXlm: number;
  feeBps: number;
  feePercent: number;
}

export interface GlobalStats {
  totalBets: string;
  totalMarkets: string;
}

export interface PayoutEstimate {
  stakeXlm: number;
  decimalOdds: number;
  potentialPayoutXlm: number;
  profitXlm: number;
  impliedProbabilityPct: number;
}

// ─── Full schedule types ──────────────────────────────────────────────────────

export type MarketType = '1x2' | 'double_chance' | 'btts' | 'over_under' | 'ht_ft' | 'correct_score' | 'asian_handicap';

export interface ScheduleOutcome {
  id: string;
  label: string;
  oddsBps: number;
}

export interface ScheduleMarket {
  type: MarketType;
  label: string;
  outcomes: ScheduleOutcome[];
}

export interface FullMatch {
  id: string;
  competition: string;
  competitionIcon: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  markets: ScheduleMarket[];
  isFeatured?: boolean;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = (await res.json()) as { success: boolean; data?: T; error?: string };
  if (!res.ok || !json.success) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json.data as T;
}

// ─── Markets ──────────────────────────────────────────────────────────────────

export const marketsApi = {
  list: () => apiFetch<Market[]>('/api/markets'),
  get: (id: string) => apiFetch<Market>(`/api/markets/${id}`),
  liveOdds: (sport: string) => apiFetch<NormalizedMarket[]>(`/api/markets/live-odds?sport=${sport}`),
};

// ─── Bets ─────────────────────────────────────────────────────────────────────

export const betsApi = {
  get: (id: string) => apiFetch<Bet>(`/api/bets/${id}`),
  getUserBets: (address: string) => apiFetch<Bet[]>(`/api/bets/user/${address}`),
  estimate: (stakeXlm: number, oddsBps: number) =>
    apiFetch<PayoutEstimate>('/api/bets/estimate', {
      method: 'POST',
      body: JSON.stringify({ stakeXlm, oddsBps }),
    }),
  globalStats: () => apiFetch<GlobalStats>('/api/bets/stats/global'),
};

// ─── Liquidity ────────────────────────────────────────────────────────────────

export const liquidityApi = {
  stats: () => apiFetch<PoolStats>('/api/liquidity/stats'),
};

// ─── Live matches ─────────────────────────────────────────────────────────────

export interface LiveMatchStats {
  homePossession?: number;
  awayPossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
}

export interface LiveMatch {
  id: string;
  sport: string;
  sportIcon: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  period: string;
  status: 'LIVE' | 'HT' | 'FT';
  startedAt: string;
  outcomes: Array<{ name: string; oddsBps: number; avgDecimalOdds: number }>;
  stats?: LiveMatchStats;
}

export const liveApi = {
  all: () => apiFetch<LiveMatch[]>('/api/live'),
  bySport: (sport: string) => apiFetch<LiveMatch[]>(`/api/live/${sport}`),
};

// ─── Virtual sports ───────────────────────────────────────────────────────────

export interface VirtualGame {
  id: string;
  category: string;
  categoryLabel: string;
  icon: string;
  description: string;
  kickoffIn: number;
  duration: number;
  outcomes: Array<{ name: string; oddsBps: number; avgDecimalOdds: number }>;
}

export interface AviatorRound {
  roundId: number;
  status: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
  crashPoint: number | null;
  startedAt: string | null;
  history: number[];
}

export const virtualsApi = {
  all: () => apiFetch<VirtualGame[]>('/api/virtuals'),
  byCategory: (cat: string) => apiFetch<VirtualGame[]>(`/api/virtuals/${cat}`),
  aviatorState: () => apiFetch<AviatorRound>('/api/virtuals/aviator/state'),
};

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface ScheduleResponse {
  data: FullMatch[];
  grouped: Record<string, FullMatch[]>;
  count: number;
}

export const scheduleApi = {
  all: () => apiFetch<ScheduleResponse>('/api/schedule').then(r => r as unknown as ScheduleResponse)
    .catch(() => apiFetch<{ data: FullMatch[]; grouped: Record<string, FullMatch[]>; count: number }>('/api/schedule')),
  featured: () => apiFetch<FullMatch[]>('/api/schedule/featured'),
  match: (id: string) => apiFetch<FullMatch>(`/api/schedule/match/${id}`),
  byCompetition: (comp: string) => apiFetch<FullMatch[]>(`/api/schedule/${comp}`),
};

// ─── Provably Fair Games ──────────────────────────────────────────────────────

export type GameType = 'dice' | 'mines' | 'plinko' | 'hilo' | 'wheel' | 'keno' | 'limbo' | 'aviator';

export interface CommitResponse {
  gameId: string;
  serverSeedHash: string;
}

export interface RevealResponse {
  gameId: string;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  resultBytes: string;
}

export interface VerifyResponse {
  valid: boolean;
  serverSeedHash: string;
  resultBytes: string;
}

export const gamesApi = {
  /** Step 1 — get server seed hash commitment before play */
  commit: (gameType: GameType) =>
    apiFetch<CommitResponse>('/api/games/commit', {
      method: 'POST',
      body: JSON.stringify({ gameType }),
    }),

  /** Step 2 — reveal server seed + derive result bytes after bet is locked */
  reveal: (gameId: string, clientSeed: string, nonce = 1) =>
    apiFetch<RevealResponse>('/api/games/reveal', {
      method: 'POST',
      body: JSON.stringify({ gameId, clientSeed, nonce }),
    }),

  /** Step 3 — independently verify any past round */
  verify: (serverSeed: string, clientSeed: string, nonce: number, resultBytes: string) =>
    apiFetch<VerifyResponse>('/api/games/verify', {
      method: 'POST',
      body: JSON.stringify({ serverSeed, clientSeed, nonce, resultBytes }),
    }),
};
