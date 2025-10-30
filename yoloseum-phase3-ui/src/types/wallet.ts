import { PublicKey } from '@solana/web3.js';

/**
 * Represents the state of a connected Solana wallet
 */
export interface WalletState {
  publicKey: PublicKey | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

/**
 * Wallet context type extending WalletState with action methods
 */
export interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

/**
 * Props for WalletProvider component
 */
export interface WalletProviderProps {
  children: React.ReactNode;
}
