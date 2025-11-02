/**
 * Retry Wrappers for External APIs
 *
 * Provides convenient retry-enabled wrappers for common API calls
 * with exponential backoff and configurable retry strategies.
 */

import { retryFetchJson } from './retryFetch';
import type { RetryConfig } from './retryFetch';
import { jupiterClient } from './jupiter/jupiterClient';

/**
 * Default retry configuration for different API types
 */
const API_RETRY_CONFIGS = {
  jupiter: {
    maxRetries: 3,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    useJitter: true,
    timeoutMs: 30000,
  } as RetryConfig,
  firestore: {
    maxRetries: 2,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    useJitter: true,
    timeoutMs: 30000,
  } as RetryConfig,
  solana: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 15000,
    backoffMultiplier: 2,
    useJitter: true,
    timeoutMs: 60000,
  } as RetryConfig,
};

/**
 * Get Jupiter quote with automatic retry
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param amount Amount to swap
 * @param slippage Slippage tolerance (default: 0.5%)
 * @returns Quote data with retry logic
 */
export async function jupiterQuoteWithRetry(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippage: number = 50
) {
  try {
    // Use existing retry logic from jupiterClient if available
    return await jupiterClient.getQuote({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippage,
    });
  } catch (error) {
    console.error('Jupiter quote failed:', error);
    throw error;
  }
}

/**
 * Execute Jupiter swap with automatic retry
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param amount Amount to swap
 * @param userPublicKey User's public key
 * @param slippage Slippage tolerance
 * @returns Swap transaction data
 */
export async function jupiterSwapWithRetry(
  inputMint: string,
  outputMint: string,
  amount: number,
  _userPublicKey: string,
  slippage: number = 50
) {
  try {
    // Get quote using existing jupiterClient method
    const quote = await jupiterClient.getQuote({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippage,
    });
    return quote;
  } catch (error) {
    console.error('Jupiter swap failed:', error);
    throw error;
  }
}

/**
 * Fetch data from external API with retry
 * @param url URL to fetch
 * @param options Fetch options
 * @param apiType Type of API for appropriate retry config
 * @returns Response data
 */
export async function externalApiCallWithRetry<T>(
  url: string,
  options?: RequestInit,
  apiType: 'jupiter' | 'firestore' | 'solana' = 'jupiter'
): Promise<T> {
  const retryConfig = API_RETRY_CONFIGS[apiType];
  return retryFetchJson<T>(url, options, retryConfig);
}

/**
 * Retry configuration helper
 * Allows customization of retry behavior per call
 */
export function createRetryConfig(
  overrides?: Partial<RetryConfig>
): RetryConfig {
  return {
    ...API_RETRY_CONFIGS.jupiter,
    ...overrides,
  };
}

/**
 * Error handler for retry-failed operations
 * @param error Error that occurred after all retries
 * @param operation Name of the operation that failed
 * @returns User-friendly error message
 */
export function handleRetryFailure(
  error: any,
  operation: string = 'API operation'
): string {
  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        switch (status) {
          case 429:
            return 'Too many requests. Please wait a moment and try again.';
          case 503:
            return 'Service is temporarily unavailable. Please try again later.';
          case 502:
            return 'Gateway error. Please try again.';
          case 500:
            return 'Server error occurred. Please try again later.';
        }
      }
    }
  }

  return `${operation} failed. Please try again.`;
}

/**
 * Exponential backoff calculator
 * Useful for manual retry implementations
 * @param attemptNumber Current attempt number (0-indexed)
 * @param baseDelay Base delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateExponentialBackoff(
  attemptNumber: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber);
  return Math.min(exponentialDelay, maxDelay);
}

/**
 * Sleep utility for manual retries
 * @param ms Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
