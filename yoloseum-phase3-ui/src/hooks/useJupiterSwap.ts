/**
 * useJupiterSwap Hook
 *
 * Custom React hook for managing Jupiter DEX swap operations including
 * quote retrieval, swap execution, and state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import type { GetQuoteParams, SwapResult, UseJupiterSwapState } from '../types/jupiter';
import { jupiterClient } from '../lib/jupiter/jupiterClient';
import { tokenToAmount } from '../lib/jupiter/tokenUtils';
import { logError } from '../lib/errorHandler';

/**
 * Return type for useJupiterSwap hook
 */
export interface UseJupiterSwapReturn extends UseJupiterSwapState {
  /** Get quote for token swap */
  getQuote: (params: GetQuoteParams) => Promise<void>;
  /** Execute swap transaction */
  executeSwap: (outputAddress?: string) => Promise<void>;
  /** Clear any current error */
  clearError: () => void;
  /** Reset state */
  reset: () => void;
}

/**
 * useJupiterSwap Hook
 *
 * Manages Jupiter DEX swap state and operations
 */
export function useJupiterSwap(): UseJupiterSwapReturn {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions, sendTransaction } = useWallet();

  const [state, setState] = useState<UseJupiterSwapState>({
    quote: null,
    loading: false,
    error: null,
    swapping: false,
    result: null,
  });

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Update state safely (only if component is mounted)
   */
  const updateState = useCallback((partial: Partial<UseJupiterSwapState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...partial }));
    }
  }, []);

  /**
   * Get swap quote from Jupiter
   */
  const getQuote = useCallback(
    async (params: GetQuoteParams) => {
      if (!publicKey) {
        updateState({
          error: new Error('Wallet not connected'),
        });
        return;
      }

      try {
        updateState({
          loading: true,
          error: null,
        });

        const quote = await jupiterClient.getQuote(params);

        updateState({
          quote,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error : new Error('Failed to get quote');
        logError(errorMsg);

        updateState({
          loading: false,
          error: errorMsg,
        });
      }
    },
    [publicKey, updateState]
  );

  /**
   * Execute swap transaction
   */
  const executeSwap = useCallback(
    async () => {
      if (!state.quote) {
        updateState({
          error: new Error('No quote available'),
        });
        return;
      }

      if (!publicKey) {
        updateState({
          error: new Error('Wallet not connected'),
        });
        return;
      }

      if (!signAllTransactions) {
        updateState({
          error: new Error('Wallet does not support transaction signing'),
        });
        return;
      }

      try {
        updateState({
          swapping: true,
          error: null,
        });

        // Get serialized transaction from Jupiter
        const swapTransactionBuf = Buffer.from(state.quote.route.routePlan as unknown as string, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        // Sign transaction with wallet
        const signedTransactions = await signAllTransactions([transaction]);

        if (!signedTransactions || signedTransactions.length === 0) {
          throw new Error('Failed to sign transaction');
        }

        // Send signed transaction
        const signature = await sendTransaction(signedTransactions[0], connection);

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: (await connection.getLatestBlockhash()).blockhash,
            lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        const result: SwapResult = {
          signature,
          confirmed: true,
        };

        updateState({
          swapping: false,
          result,
          quote: null,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error : new Error('Swap execution failed');
        logError(errorMsg);

        updateState({
          swapping: false,
          error: errorMsg,
        });
      }
    },
    [state.quote, publicKey, signAllTransactions, sendTransaction, connection, updateState]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    updateState({
      error: null,
    });
  }, [updateState]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    updateState({
      quote: null,
      loading: false,
      error: null,
      swapping: false,
      result: null,
    });
  }, [updateState]);

  return {
    ...state,
    getQuote,
    executeSwap,
    clearError,
    reset,
  };
}

/**
 * Helper hook to get quote with automatic refresh
 *
 * @param inputMint Input token mint
 * @param outputMint Output token mint
 * @param amount Input amount
 * @param slippageBps Slippage in basis points
 * @param refreshIntervalMs Interval to refresh quote (0 = no refresh)
 */
export function useJupiterQuote(
  inputMint: string | null,
  outputMint: string | null,
  amount: string,
  slippageBps: number = 50,
  refreshIntervalMs: number = 0
): UseJupiterSwapReturn {
  const swap = useJupiterSwap();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Refresh quote
   */
  const refreshQuote = useCallback(async () => {
    if (!inputMint || !outputMint || !amount) {
      return;
    }

    await swap.getQuote({
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });
  }, [swap, inputMint, outputMint, amount, slippageBps]);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    refreshQuote();

    if (refreshIntervalMs > 0) {
      refreshIntervalRef.current = setInterval(refreshQuote, refreshIntervalMs);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshQuote, refreshIntervalMs]);

  return swap;
}

/**
 * Helper hook for getting SOL-to-token quotes
 */
export function useJupiterSwapFromSOL(
  outputMint: string | null,
  solAmount: string,
  slippageBps: number = 50
): UseJupiterSwapReturn {
  const swap = useJupiterSwap();

  useEffect(() => {
    if (!outputMint || !solAmount) {
      swap.reset();
      return;
    }

    const lamports = Math.floor(parseFloat(solAmount) * 1e9).toString();

    swap.getQuote({
      inputMint: 'So11111111111111111111111111111111111111112', // SOL
      outputMint,
      amount: lamports,
      slippageBps,
    });
  }, [outputMint, solAmount, slippageBps, swap]);

  return swap;
}

/**
 * Helper hook for getting token-to-SOL quotes
 */
export function useJupiterSwapToSOL(
  inputMint: string | null,
  tokenAmount: string,
  slippageBps: number = 50
): UseJupiterSwapReturn {
  const swap = useJupiterSwap();

  useEffect(() => {
    if (!inputMint || !tokenAmount) {
      swap.reset();
      return;
    }

    const amount = tokenToAmount(tokenAmount, inputMint);

    swap.getQuote({
      inputMint,
      outputMint: 'So11111111111111111111111111111111111111112', // SOL
      amount,
      slippageBps,
    });
  }, [inputMint, tokenAmount, slippageBps, swap]);

  return swap;
}
