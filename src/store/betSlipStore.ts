/**
 * Bet slip store — manages the in-progress bet selection before submission.
 */

import { create } from 'zustand';
import { NormalizedMarket } from '@/lib/api';

export interface BetSlipItem {
  marketId: string;          // on-chain market ID (or external event ID pre-creation)
  externalEventId: string;
  description: string;       // e.g. "Arsenal vs Man Utd"
  sport: string;
  outcomeName: string;       // e.g. "Arsenal"
  outcomeIndex: number;
  oddsBps: number;
  decimalOdds: number;
}

interface BetSlipStore {
  // State
  item: BetSlipItem | null;  // single-bet slip for now
  stakeXlm: number;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;

  // Actions
  addToBetSlip: (item: BetSlipItem) => void;
  clearBetSlip: () => void;
  setStake: (xlm: number) => void;
  setSubmitting: (v: boolean) => void;
  setSubmitError: (err: string | null) => void;
  setSubmitSuccess: (v: boolean) => void;
}

export const useBetSlipStore = create<BetSlipStore>((set) => ({
  item: null,
  stakeXlm: 10,
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,

  addToBetSlip: (item) =>
    set({
      item,
      stakeXlm: 10,
      submitError: null,
      submitSuccess: false,
    }),

  clearBetSlip: () =>
    set({
      item: null,
      stakeXlm: 10,
      isSubmitting: false,
      submitError: null,
      submitSuccess: false,
    }),

  setStake: (xlm) => set({ stakeXlm: Math.max(1, xlm) }),

  setSubmitting: (v) => set({ isSubmitting: v }),

  setSubmitError: (err) => set({ submitError: err }),

  setSubmitSuccess: (v) => set({ submitSuccess: v }),
}));
