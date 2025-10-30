/**
 * Jupiter DEX Integration - Type Definitions
 *
 * This module contains all TypeScript interfaces and types used throughout
 * the Jupiter DEX integration for token swaps and liquidity management.
 */

/**
 * Token metadata and configuration
 */
export interface Token {
  /** Solana token mint address */
  address: string;
  /** Token symbol (SOL, USDC, etc) */
  symbol: string;
  /** Token full name */
  name: string;
  /** Number of decimals for token amounts */
  decimals: number;
  /** URI to token logo image */
  logoURI?: string;
  /** Whether token is native SOL */
  isNative?: boolean;
}

/**
 * Jupiter API response for token price
 */
export interface TokenPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

/**
 * Market information from Jupiter routing
 */
export interface MarketInfo {
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
}

/**
 * Swap route containing optimal path and market information
 */
export interface SwapRoute {
  /** Input token mint address */
  inputMint: string;
  /** Output token mint address */
  outputMint: string;
  /** Input amount in atomic units (lamports/smallest unit) */
  inAmount: string;
  /** Output amount in atomic units */
  outAmount: string;
  /** Minimum output amount considering slippage */
  otherAmountThreshold: string;
  /** Price impact percentage */
  priceImpactPct: number;
  /** Array of market routes */
  marketInfos: MarketInfo[];
  /** Additional route information */
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
 * Quote information for swap execution
 */
export interface SwapQuote {
  /** Input token mint address */
  inputMint: string;
  /** Output token mint address */
  outputMint: string;
  /** Input amount in atomic units */
  inputAmount: string;
  /** Expected output amount in atomic units */
  outputAmount: string;
  /** Slippage basis points (e.g., 50 = 0.5%) */
  slippageBps: number;
  /** Minimum output amount with slippage */
  minOutAmount: string;
  /** Price impact percentage */
  priceImpactPct: number;
  /** Route details */
  route: SwapRoute;
}

/**
 * Transaction data for swap execution
 */
export interface SwapTransaction {
  /** Serialized swap transaction */
  swapTransaction: string;
  /** Last valid block height for transaction */
  lastValidBlockHeight: number;
  /** Block hash for transaction */
  blockHash: string;
}

/**
 * Result of swap execution
 */
export interface SwapResult {
  /** Transaction signature */
  signature: string;
  /** Whether transaction was confirmed */
  confirmed: boolean;
  /** Error if transaction failed */
  error?: string;
  /** Transaction details */
  transaction?: {
    signature: string;
    blockTime?: number;
    slot?: number;
  };
}

/**
 * State for Jupiter swap operations
 */
export interface UseJupiterSwapState {
  /** Current swap quote */
  quote: SwapQuote | null;
  /** Whether fetching quote */
  loading: boolean;
  /** Error during quote fetch or swap */
  error: Error | null;
  /** Whether executing swap */
  swapping: boolean;
  /** Swap result after execution */
  result: SwapResult | null;
}

/**
 * Parameters for swap quote request
 */
export interface GetQuoteParams {
  /** Input token mint address */
  inputMint: string;
  /** Output token mint address */
  outputMint: string;
  /** Input amount in atomic units */
  amount: string;
  /** Slippage in basis points (default: 50) */
  slippageBps?: number;
}

/**
 * Parameters for swap execution
 */
export interface ExecuteSwapParams {
  /** User's public key for transaction signing */
  userPublicKey: string;
  /** Whether to wrap SOL if needed */
  wrapUnwrapSOL?: boolean;
  /** Dynamic compute unit price (default: 'high') */
  dynamicComputeUnitPrice?: 'low' | 'medium' | 'high';
  /** Associated token account programs */
  feeAccount?: string;
}

/**
 * Configuration for Jupiter client
 */
export interface JupiterConfig {
  /** Jupiter API URL */
  apiUrl: string;
  /** Network (devnet, mainnet-beta, etc) */
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  /** Default slippage in basis points */
  defaultSlippageBps: number;
  /** Maximum allowed slippage */
  maxSlippageBps: number;
  /** Request timeout in milliseconds */
  requestTimeoutMs: number;
  /** Enable quote caching */
  enableCache: boolean;
  /** Cache duration in milliseconds */
  cacheDurationMs: number;
}

/**
 * Error response from Jupiter API
 */
export interface JupiterError {
  statusCode: number;
  message: string;
  error: string;
  data?: Record<string, unknown>;
}
