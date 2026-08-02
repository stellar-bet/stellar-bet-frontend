import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OddsFormat } from '@/lib/odds';

interface OddsStore {
  format: OddsFormat;
  setFormat: (f: OddsFormat) => void;
}

export const useOddsStore = create<OddsStore>()(
  persist(
    (set) => ({
      format: 'decimal',
      setFormat: (format) => set({ format }),
    }),
    {
      name: 'stellar-bet-odds-format',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
