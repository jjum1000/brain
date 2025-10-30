import { PublicKey } from '@solana/web3.js';

/**
 * Vault Program ID on Solana
 * This is the address of the deployed Vault program
 *
 * Environment: Uses VITE_VAULT_PROGRAM_ID from .env.local
 * Default: Placeholder (must be updated after contract deployment)
 */
export const VAULT_PROGRAM_ID = new PublicKey(
  process.env.VITE_VAULT_PROGRAM_ID || 'VaultProgramAddressPlaceholder'
);

/**
 * Strategy Vault Addresses
 * Maps each trading strategy to its corresponding vault account
 * Each vault manages deposits/withdrawals for a specific strategy
 */
export const STRATEGY_VAULTS = {
  momentum: {
    address: new PublicKey(process.env.VITE_MOMENTUM_VAULT || 'MomentumVaultPlaceholder'),
    mint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
    decimals: 9,
  },
  contrarian: {
    address: new PublicKey(process.env.VITE_CONTRARIAN_VAULT || 'ContrarianVaultPlaceholder'),
    mint: new PublicKey('EPjFWaLb3d7h91z8UiAkfKVjGUrUVCvvJ21YWmqohWP'), // USDC
    decimals: 6,
  },
  scalping: {
    address: new PublicKey(process.env.VITE_SCALPING_VAULT || 'ScalpingVaultPlaceholder'),
    mint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
    decimals: 9,
  },
  grid: {
    address: new PublicKey(process.env.VITE_GRID_VAULT || 'GridVaultPlaceholder'),
    mint: new PublicKey('EPjFWaLb3d7h91z8UiAkfKVjGUrUVCvvJ21YWmqohWP'), // USDC
    decimals: 6,
  },
  hedging: {
    address: new PublicKey(process.env.VITE_HEDGING_VAULT || 'HedgingVaultPlaceholder'),
    mint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
    decimals: 9,
  },
};

/**
 * Contract Constants
 * Fixed parameters for vault operations
 */
export const CONTRACT_CONSTANTS = {
  // Deposit limits
  MAX_DEPOSIT_SOL: 1000, // Maximum deposit in SOL
  MIN_DEPOSIT_SOL: 0.01, // Minimum deposit in SOL
  MAX_DEPOSIT_USDC: 100000, // Maximum deposit in USDC
  MIN_DEPOSIT_USDC: 1, // Minimum deposit in USDC

  // Fee structure (basis points)
  PERFORMANCE_FEE_BPS: 2000, // 20% performance fee
  MANAGEMENT_FEE_BPS: 100, // 1% annual management fee

  // Transaction parameters
  DEFAULT_SLIPPAGE_BPS: 50, // 0.5% default slippage tolerance
  MAX_SLIPPAGE_BPS: 500, // 5% maximum slippage tolerance

  // Account rent
  TOKEN_ACCOUNT_RENT_LAMPORTS: 2039280, // Approximate rent for token account
};

/**
 * Get vault configuration by strategy ID
 * @param strategyId Strategy identifier
 * @returns Vault configuration or null if not found
 */
export function getVaultConfig(strategyId: string) {
  const config = STRATEGY_VAULTS[strategyId as keyof typeof STRATEGY_VAULTS];
  if (!config) {
    return null;
  }

  return {
    address: config.address,
    mint: config.mint,
    decimals: config.decimals,
  };
}

/**
 * Validate that required environment variables are set
 * Issues warnings for missing variables but doesn't fail
 * @returns true if validation complete (doesn't guarantee all vars are set)
 */
export function validateVaultConfig(): boolean {
  const requiredEnvVars = [
    'VITE_VAULT_PROGRAM_ID',
    'VITE_MOMENTUM_VAULT',
    'VITE_CONTRARIAN_VAULT',
    'VITE_SCALPING_VAULT',
    'VITE_GRID_VAULT',
    'VITE_HEDGING_VAULT',
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value.includes('Placeholder')) {
      console.warn(
        `⚠️  Environment variable not properly configured: ${envVar}`,
        `Current value: ${value || 'NOT SET'}`
      );
    }
  }

  return true;
}

/**
 * Token amount conversion utilities
 * Handles conversion between human-readable and blockchain units
 */
export const TokenUtils = {
  /**
   * Convert SOL amount to lamports
   * @param sol Amount in SOL
   * @returns Amount in lamports
   */
  solToLamports(sol: number): bigint {
    return BigInt(Math.floor(sol * 1_000_000_000));
  },

  /**
   * Convert lamports to SOL
   * @param lamports Amount in lamports
   * @returns Amount in SOL
   */
  lamportsToSol(lamports: bigint): number {
    return Number(lamports) / 1_000_000_000;
  },

  /**
   * Convert token amount to smallest units
   * @param amount Human-readable amount
   * @param decimals Token decimal places
   * @returns Amount in smallest units
   */
  toSmallestUnit(amount: number, decimals: number): bigint {
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  },

  /**
   * Convert from smallest units to human-readable amount
   * @param amount Amount in smallest units
   * @param decimals Token decimal places
   * @returns Human-readable amount
   */
  fromSmallestUnit(amount: bigint, decimals: number): number {
    return Number(amount) / Math.pow(10, decimals);
  },
};

/**
 * SPL Token Program ID
 * Used for token account operations
 */
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQnNrwQaFKYKqFjC');

/**
 * Associated Token Program ID
 * Used for deriving associated token accounts
 */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVqstVQmcLsNZAqeEbtQvvHqaXDLvKd9gJ'
);

/**
 * System Program ID
 * System program for basic Solana operations
 */
export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

/**
 * Solana Rent Sysvar
 * Required for rent exemption checks
 */
export const RENT_SYSVAR = new PublicKey('SysvarRent111111111111111111111111111111111');
