import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { formatPublicKey } from '@/lib/solana';

/**
 * WalletButton component - displays connect/disconnect button with wallet info
 * Uses Solana's built-in WalletMultiButton when disconnected
 * Shows public key and disconnect button when connected
 */
export const WalletButton: FC = () => {
  const { publicKey, disconnect } = useWallet();

  // Show multi-wallet selector button when not connected
  if (!publicKey) {
    return <WalletMultiButton className="btn-wallet" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300 truncate">
        {formatPublicKey(publicKey)}
      </span>
      <Button
        onClick={() => disconnect().catch((error) => console.error('Disconnect error:', error))}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Disconnect
      </Button>
    </div>
  );
};
