/**
 * Jupiter DEX API Client
 *
 * Provides typed API client for Jupiter DEX v6 API for retrieving swap quotes,
 * routes, and building swap transactions.
 */

import type { GetQuoteParams, SwapQuote, SwapRoute } from '../../types/jupiter';
import { retryGetJson, retryPostJson } from '../retryFetch';
import { getJupiterConfig } from './jupiterConfig';

/**
 * Jupiter API endpoints
 */
const JUPITER_ENDPOINTS = {
  GET_QUOTE: '/quote',
  GET_SWAP_TRANSACTION: '/swap',
  SWAP_INSTRUCTIONS: '/swap-instructions',
} as const;

/**
 * Jupiter Quote API response
 */
interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  marketInfos: Array<{
    id: string;
    label: string;
    inputMint: string;
    outputMint: string;
    notEnoughLiquidity: boolean;
    inAmount?: string;
    outAmount?: string;
    minInAmount?: string;
    minOutAmount?: string;
    priceImpactPct: number;
    lpFee: {
      amount: string;
      mint: string;
      pct: number;
    };
    platformFee: {
      amount: string;
      mint: string;
      pct: number;
    };
  }>;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
}

/**
 * Swap transaction request
 */
interface SwapTransactionRequest {
  quoteResponse: JupiterQuoteResponse;
  userPublicKey: string;
  wrapUnwrapSOL?: boolean;
  dynamicComputeUnitPrice?: 'low' | 'medium' | 'high' | 'veryHigh' | 'superHigh';
}

/**
 * Swap transaction response
 */
interface SwapTransactionResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
}

/**
 * Jupiter API Client singleton
 */
class JupiterClient {
  private static instance: JupiterClient;
  private apiUrl: string;
  private cacheMap: Map<string, { data: SwapQuote; timestamp: number }> = new Map();
  private cacheDurationMs: number;

  private constructor() {
    const config = getJupiterConfig();
    this.apiUrl = config.apiUrl;
    this.cacheDurationMs = config.cacheDurationMs;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): JupiterClient {
    if (!JupiterClient.instance) {
      JupiterClient.instance = new JupiterClient();
    }
    return JupiterClient.instance;
  }

  /**
   * Generate cache key for quote
   */
  private getCacheKey(params: GetQuoteParams): string {
    return `${params.inputMint}-${params.outputMint}-${params.amount}-${params.slippageBps || 50}`;
  }

  /**
   * Get quote from cache if available and not expired
   */
  private getFromCache(params: GetQuoteParams): SwapQuote | null {
    const key = this.getCacheKey(params);
    const cached = this.cacheMap.get(key);

    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.cacheDurationMs;
    if (isExpired) {
      this.cacheMap.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Store quote in cache
   */
  private setCache(params: GetQuoteParams, quote: SwapQuote): void {
    const key = this.getCacheKey(params);
    this.cacheMap.set(key, {
      data: quote,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cacheMap.clear();
  }

  /**
   * Get swap quote from Jupiter API
   *
   * @param params Quote parameters
   * @returns Promise resolving to swap quote
   */
  async getQuote(params: GetQuoteParams): Promise<SwapQuote> {
    // Check cache first
    const cached = this.getFromCache(params);
    if (cached) {
      return cached;
    }

    try {
      const queryParams = new URLSearchParams({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        slippageBps: (params.slippageBps || 50).toString(),
      });

      const url = `${this.apiUrl}${JUPITER_ENDPOINTS.GET_QUOTE}?${queryParams}`;

      const response = await retryGetJson<JupiterQuoteResponse>(url, {
        maxRetries: 3,
        initialDelayMs: 500,
        timeoutMs: 10000,
      });

      const quote: SwapQuote = {
        inputMint: response.inputMint,
        outputMint: response.outputMint,
        inputAmount: response.inAmount,
        outputAmount: response.outAmount,
        slippageBps: response.slippageBps,
        minOutAmount: response.otherAmountThreshold,
        priceImpactPct: parseFloat(response.priceImpactPct),
        route: {
          inputMint: response.inputMint,
          outputMint: response.outputMint,
          inAmount: response.inAmount,
          outAmount: response.outAmount,
          otherAmountThreshold: response.otherAmountThreshold,
          priceImpactPct: parseFloat(response.priceImpactPct),
          marketInfos: response.marketInfos,
          routePlan: response.routePlan,
        },
      };

      // Cache the quote
      this.setCache(params, quote);

      return quote;
    } catch (error) {
      throw this.handleError(error, 'Failed to get quote');
    }
  }

  /**
   * Get multiple routes for a swap
   *
   * @param inputMint Input token mint
   * @param outputMint Output token mint
   * @param amount Input amount
   * @returns Promise resolving to array of routes
   */
  async getRoutes(
    inputMint: string,
    outputMint: string,
    amount: string
  ): Promise<SwapRoute[]> {
    try {
      const quote = await this.getQuote({
        inputMint,
        outputMint,
        amount,
      });

      return [quote.route];
    } catch (error) {
      throw this.handleError(error, 'Failed to get routes');
    }
  }

  /**
   * Get swap transaction
   *
   * @param quoteResponse Quote response from getQuote
   * @param userPublicKey User's public key
   * @returns Promise resolving to swap transaction
   */
  async getSwapTransaction(
    quoteResponse: JupiterQuoteResponse,
    userPublicKey: string
  ): Promise<string> {
    try {
      const request: SwapTransactionRequest = {
        quoteResponse,
        userPublicKey,
        wrapUnwrapSOL: true,
        dynamicComputeUnitPrice: 'high',
      };

      const response = await retryPostJson<SwapTransactionRequest, SwapTransactionResponse>(
        `${this.apiUrl}${JUPITER_ENDPOINTS.GET_SWAP_TRANSACTION}`,
        request,
        {
          maxRetries: 2,
          initialDelayMs: 1000,
          timeoutMs: 15000,
        }
      );

      return response.swapTransaction;
    } catch (error) {
      throw this.handleError(error, 'Failed to get swap transaction');
    }
  }

  /**
   * Swap SOL to token
   *
   * @param amount Amount of SOL in lamports
   * @param outputMint Output token mint
   * @returns Promise resolving to swap quote
   */
  async swapFromSOL(amount: string, outputMint: string): Promise<SwapQuote> {
    return this.getQuote({
      inputMint: 'So11111111111111111111111111111111111111112', // SOL
      outputMint,
      amount,
    });
  }

  /**
   * Swap token to SOL
   *
   * @param amount Amount of token in atomic units
   * @param inputMint Input token mint
   * @returns Promise resolving to swap quote
   */
  async swapToSOL(amount: string, inputMint: string): Promise<SwapQuote> {
    return this.getQuote({
      inputMint,
      outputMint: 'So11111111111111111111111111111111111111112', // SOL
      amount,
    });
  }

  /**
   * Convert token to another token
   *
   * @param amount Input amount
   * @param inputMint Input token mint
   * @param outputMint Output token mint
   * @returns Promise resolving to swap quote
   */
  async swapTokens(
    amount: string,
    inputMint: string,
    outputMint: string
  ): Promise<SwapQuote> {
    return this.getQuote({
      inputMint,
      outputMint,
      amount,
    });
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      // Check if it's a Jupiter API error
      if ('statusCode' in error) {
        return new Error(`${context}: ${(error as any).message}`);
      }

      // Check for common network errors
      if (error.message.includes('429')) {
        return new Error('Rate limited by Jupiter API. Please try again in a moment.');
      }

      if (error.message.includes('503')) {
        return new Error('Jupiter API is temporarily unavailable. Please try again later.');
      }

      if (error.message.includes('No routes found')) {
        return new Error('No swap routes found for this token pair.');
      }

      return error;
    }

    return new Error(`${context}: Unknown error`);
  }
}

/**
 * Export singleton instance
 */
export const jupiterClient = JupiterClient.getInstance();

/**
 * Export client class for testing
 */
export { JupiterClient };
