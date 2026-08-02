/**
 * Freighter wallet integration
 * https://www.freighter.app/
 *
 * All wallet interactions are isolated here so components stay clean.
 */

import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
  signAuthEntry,
} from '@stellar/freighter-api';

export type FreighterNetwork = 'TESTNET' | 'PUBLIC' | 'FUTURENET';

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: FreighterNetwork | null;
}

/** Check if Freighter extension is installed */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/** Check if site is already allowed by user */
export async function isSiteAllowed(): Promise<boolean> {
  try {
    const result = await isAllowed();
    return result.isAllowed;
  } catch {
    return false;
  }
}

/** Request wallet access — shows Freighter popup */
export async function connectWallet(): Promise<WalletState> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error(
      'Freighter wallet not found. Install it at https://www.freighter.app/'
    );
  }

  const accessResult = await requestAccess();
  if (accessResult.error) {
    throw new Error(accessResult.error);
  }

  const addressResult = await getAddress();
  if (addressResult.error) {
    throw new Error(addressResult.error);
  }

  const networkResult = await getNetwork();
  const network = networkResult.error
    ? null
    : (networkResult.network as FreighterNetwork);

  return {
    connected: true,
    address: addressResult.address,
    network,
  };
}

/** Get current wallet state without prompting */
export async function getWalletState(): Promise<WalletState> {
  const installed = await isFreighterInstalled();
  if (!installed) return { connected: false, address: null, network: null };

  const allowed = await isSiteAllowed();
  if (!allowed) return { connected: false, address: null, network: null };

  try {
    const [addressResult, networkResult] = await Promise.all([
      getAddress(),
      getNetwork(),
    ]);

    return {
      connected: !addressResult.error,
      address: addressResult.error ? null : addressResult.address,
      network: networkResult.error
        ? null
        : (networkResult.network as FreighterNetwork),
    };
  } catch {
    return { connected: false, address: null, network: null };
  }
}

/** Sign a Soroban transaction XDR — used for place_bet, claim_payout, etc. */
export async function signTx(
  txXdr: string,
  networkPassphrase: string
): Promise<string> {
  const result = await signTransaction(txXdr, { networkPassphrase });
  if (result.error) {
    throw new Error(result.error);
  }
  return result.signedTxXdr;
}

/** Validate that wallet is on the expected network */
export function validateNetwork(
  walletNetwork: FreighterNetwork | null,
  expectedNetwork: string
): boolean {
  if (!walletNetwork) return false;
  const expected = expectedNetwork.toUpperCase();
  return walletNetwork === expected || walletNetwork.includes(expected);
}
