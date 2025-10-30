import React, { createContext, useState } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import type { PublicKey } from '@solana/web3.js';
import { getSolanaRpcUrl, walletAdapters, getSolanaErrorMessage } from '@/lib/solana';
import type { WalletContextType, WalletProviderProps } from '@/types/wallet';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = getSolanaRpcUrl();

  const handleConnect = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      // Connection will be handled by Solana wallet adapter's useWallet hook
      // This is just a placeholder for now
    } catch (err) {
      const errorMessage = getSolanaErrorMessage(err);
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      setPublicKey(null);
      setIsConnected(false);
    } catch (err) {
      const errorMessage = getSolanaErrorMessage(err);
      setError(errorMessage);
      console.error('Wallet disconnection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: WalletContextType = {
    publicKey,
    isConnected,
    isConnecting,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    clearError,
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={walletAdapters} onError={(error) => {
        const errorMessage = getSolanaErrorMessage(error);
        setError(errorMessage);
        console.error('Solana wallet error:', error);
      }} autoConnect={true}>
        <WalletModalProvider>
          <WalletContext.Provider value={value}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
