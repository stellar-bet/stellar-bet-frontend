/**
 * useProvablyFair — React hook for the commit-reveal game flow.
 *
 * Usage:
 *   const pf = useProvablyFair('dice');
 *
 *   // Before play: fetch commitment
 *   await pf.commit();
 *   // pf.serverSeedHash is now set — show it to the player
 *
 *   // After bet is locked: reveal and get result floats
 *   const floats = await pf.reveal();
 *   // Use floats[0], floats[1], … to derive game outcome
 *
 *   // pf.lastReveal has serverSeed, clientSeed, resultBytes for verification
 */

import { useState, useCallback } from 'react';
import { gamesApi, GameType, RevealResponse } from '@/lib/api';
import { resultBytesToFloats } from '@/lib/gameUtils';

// Default number of floats to derive — enough for all games
const DEFAULT_FLOAT_COUNT = 32;

export interface ProvablyFairState {
  /** sha256(serverSeed) shown to player before the round */
  serverSeedHash: string | null;
  /** Internal game ID for the pending round */
  gameId: string | null;
  /** Player's client seed (editable before reveal) */
  clientSeed: string;
  /** Auto-incrementing nonce per session */
  nonce: number;
  /** Full reveal data from the last completed round */
  lastReveal: RevealResponse | null;
  /** Whether a commit or reveal is in flight */
  loading: boolean;
  /** Last error message */
  error: string | null;
}

export interface ProvablyFairHook extends ProvablyFairState {
  /** Step 1: fetch a new server seed commitment */
  commit: () => Promise<void>;
  /**
   * Step 2: reveal the server seed and return result floats.
   * floatCount: how many floats to derive (default 32)
   */
  reveal: (floatCount?: number) => Promise<number[]>;
  /** Let the player change their client seed before reveal */
  setClientSeed: (seed: string) => void;
}

export function useProvablyFair(gameType: GameType): ProvablyFairHook {
  const [state, setState] = useState<ProvablyFairState>({
    serverSeedHash: null,
    gameId: null,
    clientSeed: () => {
      // Generate a random default client seed once on mount
      if (typeof window === 'undefined') return 'default-client-seed';
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    },
    nonce: 1,
    lastReveal: null,
    loading: false,
    error: null,
  });

  const commit = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null, serverSeedHash: null, gameId: null }));
    try {
      const data = await gamesApi.commit(gameType);
      setState(s => ({
        ...s,
        serverSeedHash: data.serverSeedHash,
        gameId: data.gameId,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get commitment';
      setState(s => ({ ...s, loading: false, error: message }));
    }
  }, [gameType]);

  const reveal = useCallback(async (floatCount = DEFAULT_FLOAT_COUNT): Promise<number[]> => {
    if (!state.gameId) throw new Error('No active game — call commit() first');
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await gamesApi.reveal(state.gameId, state.clientSeed, state.nonce);
      setState(s => ({
        ...s,
        lastReveal: data,
        loading: false,
        gameId: null,
        serverSeedHash: null,
        nonce: s.nonce + 1,
      }));
      return resultBytesToFloats(data.resultBytes, floatCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reveal';
      setState(s => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, [state.gameId, state.clientSeed, state.nonce]);

  const setClientSeed = useCallback((seed: string) => {
    setState(s => ({ ...s, clientSeed: seed }));
  }, []);

  return { ...state, commit, reveal, setClientSeed };
}
