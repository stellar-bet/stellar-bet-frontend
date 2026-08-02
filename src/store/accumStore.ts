/**
 * Accumulator (multi-bet) store.
 * Users can add up to 20 selections from different matches.
 * The combined odds multiply together for the total payout.
 */

import { create } from 'zustand';
import { FullMatch, ScheduleMarket, ScheduleOutcome } from '@/lib/api';

export interface AccumSelection {
  matchId: string;
  matchDesc: string;       // "Arsenal vs Man Utd"
  competition: string;
  marketType: string;
  marketLabel: string;
  outcomeId: string;
  outcomeLabel: string;
  oddsBps: number;
}

interface AccumStore {
  selections: AccumSelection[];
  stakeXlm: number;
  isSubmitting: boolean;
  submitError: string | null;

  addSelection: (sel: AccumSelection) => void;
  removeSelection: (matchId: string, outcomeId: string) => void;
  clearAll: () => void;
  setStake: (xlm: number) => void;
  setSubmitting: (v: boolean) => void;
  setSubmitError: (e: string | null) => void;
  hasSelection: (matchId: string, outcomeId: string) => boolean;
}

export const useAccumStore = create<AccumStore>((set, get) => ({
  selections: [],
  stakeXlm: 10,
  isSubmitting: false,
  submitError: null,

  addSelection: (sel) => {
    const existing = get().selections;
    // One selection per match
    const filtered = existing.filter(s => s.matchId !== sel.matchId);
    if (filtered.length >= 20) return; // max 20 legs
    set({ selections: [...filtered, sel] });
  },

  removeSelection: (matchId, outcomeId) => {
    set(s => ({
      selections: s.selections.filter(
        sel => !(sel.matchId === matchId && sel.outcomeId === outcomeId)
      ),
    }));
  },

  clearAll: () => set({ selections: [], submitError: null }),

  setStake: (xlm) => set({ stakeXlm: Math.max(1, xlm) }),

  setSubmitting: (v) => set({ isSubmitting: v }),

  setSubmitError: (e) => set({ submitError: e }),

  hasSelection: (matchId, outcomeId) =>
    get().selections.some(s => s.matchId === matchId && s.outcomeId === outcomeId),
}));

/** Combined odds = product of all leg odds (in decimal) */
export function calcAccumOdds(selections: AccumSelection[]): number {
  if (selections.length === 0) return 1;
  return selections.reduce((prod, s) => prod * (s.oddsBps / 10_000), 1);
}

/** Potential payout */
export function calcAccumPayout(stakeXlm: number, selections: AccumSelection[]): number {
  return stakeXlm * calcAccumOdds(selections);
}
