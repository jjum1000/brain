/**
 * Jupiter Token Utilities
 *
 * Provides utility functions for token handling, formatting, and conversions
 * including decimals, display formatting, and token lookups.
 */

import type { Token } from '../../types/jupiter';
import { SUPPORTED_TOKENS, getTokenByAddress, getTokenBySymbol } from './jupiterConfig';

/**
 * Get decimals for a token by its mint address
 */
export function getTokenDecimals(tokenAddress: string): number {
  const token = getTokenByAddress(tokenAddress);
  if (!token) {
    throw new Error(`Token not found: ${tokenAddress}`);
  }
  return token.decimals;
}

/**
 * Convert token amount from display value to atomic units (considering decimals)
 *
 * @param amount Display amount (e.g., "1.5" SOL)
 * @param tokenAddress Token mint address
 * @returns Amount in atomic units (e.g., lamports for SOL)
 */
export function tokenToAmount(amount: string | number, tokenAddress: string): string {
  const decimals = getTokenDecimals(tokenAddress);
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  return Math.floor(amountNum * Math.pow(10, decimals)).toString();
}

/**
 * Convert token amount from atomic units to display value
 *
 * @param amount Amount in atomic units
 * @param tokenAddress Token mint address
 * @returns Display amount as string
 */
export function amountToToken(amount: string | number, tokenAddress: string): string {
  const decimals = getTokenDecimals(tokenAddress);
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  return (amountNum / Math.pow(10, decimals)).toString();
}

/**
 * Format token amount for display with proper decimals
 *
 * @param amount Amount in atomic units
 * @param tokenAddress Token mint address
 * @param displayDecimals Number of decimal places to show (default: 2)
 * @returns Formatted display string
 */
export function formatTokenAmount(
  amount: string | number,
  tokenAddress: string,
  displayDecimals: number = 2
): string {
  const displayAmount = amountToToken(amount, tokenAddress);
  const num = parseFloat(displayAmount);

  if (isNaN(num)) {
    return '0';
  }

  return num.toFixed(displayDecimals);
}

/**
 * Format token amount with symbol
 *
 * @param amount Amount in atomic units
 * @param tokenAddress Token mint address
 * @param displayDecimals Number of decimal places (default: 2)
 * @returns Formatted string with symbol (e.g., "1.50 SOL")
 */
export function formatTokenAmountWithSymbol(
  amount: string | number,
  tokenAddress: string,
  displayDecimals: number = 2
): string {
  const token = getTokenByAddress(tokenAddress);
  if (!token) {
    throw new Error(`Token not found: ${tokenAddress}`);
  }

  const formatted = formatTokenAmount(amount, tokenAddress, displayDecimals);
  return `${formatted} ${token.symbol}`;
}

/**
 * Get token by address
 */
export function getToken(address: string): Token | undefined {
  return getTokenByAddress(address);
}

/**
 * Get token by symbol
 */
export function getTokenByName(symbol: string): Token | undefined {
  return getTokenBySymbol(symbol);
}

/**
 * Get all supported tokens
 */
export function getAllSupportedTokens(): Token[] {
  return Object.values(SUPPORTED_TOKENS);
}

/**
 * Check if token is native SOL
 */
export function isNativeToken(tokenAddress: string): boolean {
  const token = getTokenByAddress(tokenAddress);
  return token?.isNative ?? false;
}

/**
 * Get token symbol by address
 */
export function getTokenSymbol(tokenAddress: string): string {
  const token = getTokenByAddress(tokenAddress);
  if (!token) {
    return 'UNKNOWN';
  }
  return token.symbol;
}

/**
 * Get token name by address
 */
export function getTokenName(tokenAddress: string): string {
  const token = getTokenByAddress(tokenAddress);
  if (!token) {
    return 'Unknown Token';
  }
  return token.name;
}

/**
 * Calculate minimum amount received considering slippage
 *
 * @param outputAmount Expected output amount in atomic units
 * @param slippageBps Slippage in basis points (e.g., 50 = 0.5%)
 * @returns Minimum output amount in atomic units
 */
export function calculateMinimumAmountWithSlippage(
  outputAmount: string | number,
  slippageBps: number
): string {
  const amount = typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount;

  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${outputAmount}`);
  }

  // Convert basis points to percentage: 50 bps = 0.5% = 0.005
  const slippagePercent = slippageBps / 10000;

  // Minimum amount = output * (1 - slippage)
  const minimumAmount = amount * (1 - slippagePercent);

  return Math.floor(minimumAmount).toString();
}

/**
 * Calculate slippage amount
 *
 * @param outputAmount Expected output amount in atomic units
 * @param slippageBps Slippage in basis points
 * @returns Slippage amount in atomic units
 */
export function calculateSlippageAmount(
  outputAmount: string | number,
  slippageBps: number
): string {
  const amount = typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount;

  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${outputAmount}`);
  }

  const slippagePercent = slippageBps / 10000;
  const slippageAmount = amount * slippagePercent;

  return Math.floor(slippageAmount).toString();
}

/**
 * Validate token pair is supported for swapping
 */
export function isValidTokenPair(inputToken: string, outputToken: string): boolean {
  if (inputToken === outputToken) {
    return false;
  }

  const inputSupported = Object.values(SUPPORTED_TOKENS).some(t => t.address === inputToken);
  const outputSupported = Object.values(SUPPORTED_TOKENS).some(t => t.address === outputToken);

  return inputSupported && outputSupported;
}
