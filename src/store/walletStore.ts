/**
 * Zustand wallet store — global wallet state, persisted in sessionStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { connectWallet, getWalletState, FreighterNetwork } from '@/lib/freighter';

interface WalletStore {
  // State
  address: string | null;
  network: FreighterNetwork | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, _get) => ({
      address: null,
      network: null,
      isConnected: false,
      isConnecting: false,
      error: null,

      connect: async () => {
        set({ isConnecting: true, error: null });
        try {
          const state = await connectWallet();
          set({
            address: state.address,
            network: state.network,
            isConnected: state.connected,
            isConnecting: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Connection failed',
            isConnecting: false,
            isConnected: false,
          });
        }
      },

      disconnect: () => {
        set({
          address: null,
          network: null,
          isConnected: false,
          error: null,
        });
      },

      refresh: async () => {
        try {
          const state = await getWalletState();
          set({
            address: state.address,
            network: state.network,
            isConnected: state.connected,
          });
        } catch {
          // Silent refresh failure — don't reset existing state
        }
      },
    }),
    {
      name: 'stellar-bet-wallet',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
      partialize: (state) => ({
        address: state.address,
        network: state.network,
        isConnected: state.isConnected,
      }),
    }
  )
);
