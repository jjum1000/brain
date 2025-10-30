import type { FC } from 'react';

/**
 * WalletModal component - displays wallet selection modal
 * This is a wrapper around Solana's built-in WalletModal
 * The modal automatically appears when user clicks the connect button
 *
 * Note: The wallet modal is automatically shown by WalletMultiButton
 * This component is here for future custom implementations if needed
 */
export const WalletSelectionModal: FC = () => {
  // The modal is handled by @solana/wallet-adapter-react-ui
  return null;
};

export default WalletSelectionModal;
