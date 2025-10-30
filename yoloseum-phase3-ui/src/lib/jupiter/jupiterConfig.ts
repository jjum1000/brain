/**
 * Jupiter DEX Configuration
 *
 * Contains all configuration constants and token definitions for Jupiter
 * DEX integration including network settings, token lists, and API endpoints.
 */

import type { JupiterConfig, Token } from '../../types/jupiter';

/**
 * Solana token mint addresses
 */
export const MINT_ADDRESSES = {
  /** Native SOL token address */
  SOL: 'So11111111111111111111111111111111111111112',
  /** USDC token address on devnet/mainnet */
  USDC: 'EPjFWaLb3hyccqaoro45VqkfrisvfABjQp7u3UqEFXp',
  /** USDT token address on mainnet */
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJNCc',
} as const;

/**
 * Supported tokens for swaps
 * Currently supports SOL and USDC
 */
export const SUPPORTED_TOKENS: Record<string, Token> = {
  SOL: {
    address: MINT_ADDRESSES.SOL,
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    isNative: true,
  },
  USDC: {
    address: MINT_ADDRESSES.USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWaLb3hyccqaoro45VqkfrisvfABjQp7u3UqEFXp/logo.png',
  },
};

/**
 * Slippage configuration in basis points
 * 1 basis point = 0.01%
 */
export const SLIPPAGE_CONFIG = {
  /** Default slippage: 0.5% */
  DEFAULT: 50,
  /** Low slippage: 0.1% */
  LOW: 10,
  /** Medium slippage: 0.5% */
  MEDIUM: 50,
  /** High slippage: 1% */
  HIGH: 100,
  /** Max allowed slippage: 5% */
  MAX: 500,
} as const;

/**
 * Jupiter API endpoint configuration
 */
export const JUPITER_API_CONFIG = {
  /** Production Jupiter API URL */
  MAINNET_API: 'https://quote-api.jup.ag/v6',
  /** Development Jupiter API URL */
  DEVNET_API: 'https://quote-api.jup.ag/v6',

  /** API request timeout in milliseconds */
  REQUEST_TIMEOUT_MS: 10000,

  /** Enable quote response caching */
  ENABLE_CACHE: true,

  /** Cache duration in milliseconds (5 minutes) */
  CACHE_DURATION_MS: 5 * 60 * 1000,
} as const;

/**
 * Get Jupiter configuration for current network
 */
export function getJupiterConfig(): JupiterConfig {
  const network = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as 'devnet' | 'mainnet-beta' | 'testnet';

  return {
    apiUrl: JUPITER_API_CONFIG.MAINNET_API, // Jupiter v6 uses same API for all networks
    network,
    defaultSlippageBps: SLIPPAGE_CONFIG.DEFAULT,
    maxSlippageBps: SLIPPAGE_CONFIG.MAX,
    requestTimeoutMs: JUPITER_API_CONFIG.REQUEST_TIMEOUT_MS,
    enableCache: JUPITER_API_CONFIG.ENABLE_CACHE,
    cacheDurationMs: JUPITER_API_CONFIG.CACHE_DURATION_MS,
  };
}

/**
 * Get token by mint address
 */
export function getTokenByAddress(address: string): Token | undefined {
  return Object.values(SUPPORTED_TOKENS).find(token => token.address === address);
}

/**
 * Get token by symbol
 */
export function getTokenBySymbol(symbol: string): Token | undefined {
  return SUPPORTED_TOKENS[symbol];
}

/**
 * Get all supported token addresses
 */
export function getSupportedTokenAddresses(): string[] {
  return Object.values(SUPPORTED_TOKENS).map(token => token.address);
}

/**
 * Get all supported token symbols
 */
export function getSupportedTokenSymbols(): string[] {
  return Object.keys(SUPPORTED_TOKENS);
}

/**
 * Validate if token address is supported
 */
export function isSupportedToken(address: string): boolean {
  return getSupportedTokenAddresses().includes(address);
}
