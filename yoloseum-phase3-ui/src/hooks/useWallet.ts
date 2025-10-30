import { useContext } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletContext } from '@/context/WalletContext';
import type { WalletContextType } from '@/types/wallet';

/**
 * Custom hook to access wallet context
 * Provides access to wallet state and methods
 *
 * @returns WalletContextType with wallet state and methods
 * @throws Error if used outside WalletProvider
 *
 * @example
 * const { publicKey, isConnected, connect, disconnect } = useWallet();
 */
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  return context;
};

/**
 * Hook to access Solana wallet adapter directly
 * Use this for more advanced wallet operations
 *
 * @returns Solana wallet adapter state and methods
 *
 * @example
 * const { publicKey, wallet, connected } = useSolanaWallet();
 */
export const useWalletAdapter = () => {
  return useSolanaWallet();
};
