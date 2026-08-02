export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001/ws';
export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';

export const CONTRACT_IDS = {
  bettingPool: process.env.NEXT_PUBLIC_CONTRACT_BETTING_POOL ?? '',
  houseEscrow: process.env.NEXT_PUBLIC_CONTRACT_HOUSE_ESCROW ?? '',
  betToken: process.env.NEXT_PUBLIC_CONTRACT_BET_TOKEN ?? '',
} as const;

// 1 XLM = 10,000,000 stroops
export const STROOPS_PER_XLM = 10_000_000n;

export const SPORT_LABELS: Record<string, string> = {
  soccer_epl: 'Premier League',
  soccer_uefa_champs_league: 'Champions League',
  soccer_africa_cup_of_nations: 'AFCON',
  basketball_nba: 'NBA',
  americanfootball_nfl: 'NFL',
  mma_mixed_martial_arts: 'MMA',
};

export const SPORT_ICONS: Record<string, string> = {
  soccer_epl: '⚽',
  soccer_uefa_champs_league: '🏆',
  soccer_africa_cup_of_nations: '⚽',
  basketball_nba: '🏀',
  americanfootball_nfl: '🏈',
  mma_mixed_martial_arts: '🥊',
  tennis: '🎾',
};

export const VIRTUAL_CATEGORY_LABELS: Record<string, string> = {
  virtual_football: 'Virtual Football',
  virtual_basketball: 'Virtual Basketball',
  virtual_horses: 'Virtual Horses',
  virtual_dogs: 'Virtual Greyhounds',
};

export const VIRTUAL_CATEGORY_ICONS: Record<string, string> = {
  virtual_football: '⚽',
  virtual_basketball: '🏀',
  virtual_horses: '🐎',
  virtual_dogs: '🐕',
};

export const BET_STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  Won: 'Won',
  Lost: 'Lost',
  Cancelled: 'Cancelled',
  PendingSettlement: 'Settling...',
};

export const BET_STATUS_COLORS: Record<string, string> = {
  Open: 'text-pending',
  Won: 'text-win',
  Lost: 'text-loss',
  Cancelled: 'text-gray-400',
  PendingSettlement: 'text-blue-400',
};
