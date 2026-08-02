/**
 * User profile store.
 * Stores registration data locally (username, avatar, currency preference).
 * In production this would be persisted to a backend tied to the wallet address.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Currency = 'XLM' | 'USD' | 'NGN' | 'GHS' | 'KES' | 'ZAR';
export type Avatar = 'star' | 'rocket' | 'diamond' | 'fire' | 'crown' | 'thunder';

export interface UserProfile {
  username: string;
  avatar: Avatar;
  currency: Currency;
  country: string;
  createdAt: string;
  isRegistered: boolean;
}

interface UserStore {
  profile: UserProfile | null;
  register: (data: Omit<UserProfile, 'createdAt' | 'isRegistered'>) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,

      register: (data) => set({
        profile: {
          ...data,
          createdAt: new Date().toISOString(),
          isRegistered: true,
        },
      }),

      updateProfile: (data) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
      })),

      logout: () => set({ profile: null }),
    }),
    {
      name: 'stellar-bet-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const AVATAR_ICONS: Record<Avatar, string> = {
  star:    '⭐',
  rocket:  '🚀',
  diamond: '💎',
  fire:    '🔥',
  crown:   '👑',
  thunder: '⚡',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  XLM: 'XLM (Stellar)',
  USD: 'USD ($)',
  NGN: 'NGN (₦)',
  GHS: 'GHS (₵)',
  KES: 'KES (KSh)',
  ZAR: 'ZAR (R)',
};

export const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Tanzania', 'Uganda',
  'Ethiopia', 'Cameroon', 'Senegal', 'Ivory Coast', 'United Kingdom',
  'United States', 'Canada', 'Brazil', 'India', 'Other',
];
