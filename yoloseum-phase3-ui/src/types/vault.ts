import { PublicKey } from '@solana/web3.js';

/**
 * Vault Configuration
 * Contains on-chain vault account information
 */
export interface VaultConfig {
  address: PublicKey;
  authority: PublicKey;
  mint: PublicKey; // Token (SOL, USDC, etc.)
  totalShares: bigint;
  totalDeposited: bigint;
  decimals: number;
}

/**
 * User's Vault Account
 * Tracks user's position in a vault
 */
export interface VaultAccount {
  userAddress: PublicKey;
  shares: bigint;
  deposited: bigint;
  withdrawn: bigint;
  earnings: bigint;
}

/**
 * Deposit Operation Parameters
 * Used to initiate a deposit transaction
 */
export interface DepositParams {
  vaultAddress: PublicKey;
  amount: bigint; // In token's smallest unit (lamports for SOL, etc.)
  userPublicKey: PublicKey;
  slippageBps?: number; // Basis points (50 = 0.5%)
}

/**
 * Withdrawal Operation Parameters
 * Used to initiate a withdrawal transaction
 */
export interface WithdrawParams {
  vaultAddress: PublicKey;
  shares: bigint; // Number of shares to withdraw
  userPublicKey: PublicKey;
  minAmount?: bigint; // Minimum amount to receive
}

/**
 * Successful Deposit Result
 */
export interface DepositResult {
  transactionSignature: string;
  sharesIssued: bigint;
  timestamp: number;
}

/**
 * Successful Withdrawal Result
 */
export interface WithdrawResult {
  transactionSignature: string;
  amountReceived: bigint;
  timestamp: number;
}

/**
 * Vault-specific Error Information
 */
export interface VaultError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Vault State for UI
 * Tracks the state of vault operations
 */
export interface VaultState {
  depositing: boolean;
  withdrawing: boolean;
  loading: boolean;
  error: Error | null;
  lastDepositHash?: string;
  lastWithdrawHash?: string;
}

/**
 * Vault Statistics for Display
 */
export interface VaultStats {
  tvl: bigint; // Total Value Locked
  shares: bigint; // User's shares
  sharePrice: number; // TVL / Total Shares
  userBalance: bigint; // User's position value
  apy: number; // Annual Percentage Yield
}

/**
 * Transaction Metadata for Firestore
 */
export interface VaultTransactionMetadata {
  vaultAddress: string;
  shares?: bigint;
  amount?: bigint;
  sharesIssued?: bigint;
  amountReceived?: bigint;
  source: 'vault_deposit' | 'vault_withdraw' | 'swap_deposit';
}
