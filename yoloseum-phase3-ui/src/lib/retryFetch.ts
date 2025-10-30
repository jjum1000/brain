/**
 * Retry Fetch Utility
 *
 * Provides HTTP request functionality with exponential backoff retry logic
 * for handling transient failures, rate limiting, and network issues.
 */

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add random jitter to delay (default: true) */
  useJitter?: boolean;
  /** Timeout for each request in milliseconds (default: 30000) */
  timeoutMs?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  useJitter: true,
  timeoutMs: 30000,
};

/**
 * Check if error is retryable (transient failure)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // Network errors
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('failed to fetch') ||
      message.includes('aborted')
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('ehostunreach')
    );
  }

  return false;
}

/**
 * Check if HTTP status code indicates a retryable error
 */
function isRetryableStatus(status: number): boolean {
  return (
    status === 408 || // Request Timeout
    status === 429 || // Too Many Requests (Rate Limiting)
    status === 500 || // Internal Server Error
    status === 502 || // Bad Gateway
    status === 503 || // Service Unavailable
    status === 504    // Gateway Timeout
  );
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  if (!config.useJitter) {
    return cappedDelay;
  }

  // Add random jitter (±25% of delay)
  const jitter = cappedDelay * 0.25 * (Math.random() - 0.5);
  return Math.max(100, cappedDelay + jitter); // Ensure minimum 100ms
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry logic using exponential backoff
 *
 * @param url URL to fetch
 * @param options Fetch options
 * @param retryConfig Retry configuration
 * @returns Promise resolving to Response
 */
export async function retryFetch(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      const fetchOptions: RequestInit = {
        ...options,
        signal: controller.signal,
      };

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // If response is ok, return it
      if (response.ok) {
        return response;
      }

      // If status is not retryable, throw immediately
      if (!isRetryableStatus(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

      // If this is the last attempt, throw
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Calculate delay and retry
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
      continue;
    } catch (error) {
      lastError = error;

      // If error is not retryable, throw immediately
      if (!isRetryableError(error)) {
        throw error;
      }

      // If this is the last attempt, throw
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay and retry
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }

  // Should not reach here, but throw last error as fallback
  throw lastError || new Error('Unknown error during retry fetch');
}

/**
 * Fetch JSON with retry logic
 *
 * @param url URL to fetch
 * @param options Fetch options
 * @param retryConfig Retry configuration
 * @returns Promise resolving to parsed JSON
 */
export async function retryFetchJson<T>(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<T> {
  const response = await retryFetch(url, options, retryConfig);
  return response.json() as Promise<T>;
}

/**
 * POST request with retry logic
 *
 * @param url URL to post to
 * @param body Request body
 * @param retryConfig Retry configuration
 * @returns Promise resolving to Response
 */
export async function retryPost<T>(
  url: string,
  body: T,
  retryConfig?: RetryConfig
): Promise<Response> {
  return retryFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, retryConfig);
}

/**
 * POST JSON request with retry logic
 *
 * @param url URL to post to
 * @param body Request body
 * @param retryConfig Retry configuration
 * @returns Promise resolving to parsed JSON response
 */
export async function retryPostJson<TReq, TRes>(
  url: string,
  body: TReq,
  retryConfig?: RetryConfig
): Promise<TRes> {
  const response = await retryPost(url, body, retryConfig);
  return response.json() as Promise<TRes>;
}

/**
 * GET request with retry logic
 *
 * @param url URL to fetch
 * @param retryConfig Retry configuration
 * @returns Promise resolving to Response
 */
export async function retryGet(
  url: string,
  retryConfig?: RetryConfig
): Promise<Response> {
  return retryFetch(url, { method: 'GET' }, retryConfig);
}

/**
 * GET JSON request with retry logic
 *
 * @param url URL to fetch
 * @param retryConfig Retry configuration
 * @returns Promise resolving to parsed JSON
 */
export async function retryGetJson<T>(
  url: string,
  retryConfig?: RetryConfig
): Promise<T> {
  return retryFetchJson<T>(url, { method: 'GET' }, retryConfig);
}
