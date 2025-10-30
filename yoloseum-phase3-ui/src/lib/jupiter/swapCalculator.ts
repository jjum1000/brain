/**
 * Swap Calculator Utilities
 *
 * Provides calculation functions for swap operations including slippage,
 * price impact, fees, and unit conversions.
 */

/**
 * Calculate minimum amount with slippage tolerance
 *
 * @param expectedAmount Expected output amount
 * @param slippageBps Slippage in basis points (50 = 0.5%)
 * @returns Minimum amount to receive
 */
export function calculateMinimumAmount(
  expectedAmount: string | number,
  slippageBps: number
): string {
  const amount = typeof expectedAmount === 'string' ? parseFloat(expectedAmount) : expectedAmount;

  if (isNaN(amount) || amount < 0) {
    throw new Error(`Invalid amount: ${expectedAmount}`);
  }

  // Convert basis points to decimal (50 bps = 0.005)
  const slippageDecimal = slippageBps / 10000;

  // Minimum = Amount * (1 - slippage%)
  const minimumAmount = amount * (1 - slippageDecimal);

  return Math.floor(minimumAmount).toString();
}

/**
 * Calculate slippage amount
 *
 * @param expectedAmount Expected output amount
 * @param slippageBps Slippage in basis points
 * @returns Amount lost to slippage
 */
export function calculateSlippageAmount(
  expectedAmount: string | number,
  slippageBps: number
): string {
  const amount = typeof expectedAmount === 'string' ? parseFloat(expectedAmount) : expectedAmount;

  if (isNaN(amount) || amount < 0) {
    throw new Error(`Invalid amount: ${expectedAmount}`);
  }

  const slippageDecimal = slippageBps / 10000;
  const slippageAmount = amount * slippageDecimal;

  return Math.floor(slippageAmount).toString();
}

/**
 * Calculate price impact percentage
 *
 * @param inputAmount Input amount in atomic units
 * @param outputAmount Output amount in atomic units
 * @param spotPrice Spot price (output per input unit)
 * @returns Price impact as percentage string (e.g., "0.5" for 0.5%)
 */
export function calculatePriceImpact(
  inputAmount: string | number,
  outputAmount: string | number,
  spotPrice: number
): string {
  const inAmount = typeof inputAmount === 'string' ? parseFloat(inputAmount) : inputAmount;
  const outAmount = typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount;

  if (isNaN(inAmount) || isNaN(outAmount) || inAmount <= 0) {
    return '0';
  }

  // Ideal output at spot price = input * spotPrice
  const idealOutput = inAmount * spotPrice;

  // Price impact = (ideal - actual) / ideal * 100
  if (idealOutput === 0) {
    return '0';
  }

  const priceImpact = ((idealOutput - outAmount) / idealOutput) * 100;

  // Ensure it's not negative (shouldn't happen but be safe)
  return Math.max(0, priceImpact).toFixed(4);
}

/**
 * Calculate fee amount
 *
 * @param amount Amount being swapped
 * @param feePercentage Fee as percentage (e.g., 0.25 for 0.25%)
 * @returns Fee amount
 */
export function calculateFeeAmount(
  amount: string | number,
  feePercentage: number = 0.25
): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum) || amountNum < 0) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const feeDecimal = feePercentage / 100;
  const feeAmount = amountNum * feeDecimal;

  return Math.floor(feeAmount).toString();
}

/**
 * Calculate net amount after fees
 *
 * @param amount Amount before fees
 * @param feePercentage Fee percentage
 * @returns Amount after fees
 */
export function calculateNetAmount(
  amount: string | number,
  feePercentage: number = 0.25
): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum) || amountNum < 0) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const feeDecimal = feePercentage / 100;
  const netAmount = amountNum * (1 - feeDecimal);

  return Math.floor(netAmount).toString();
}

/**
 * Convert lamports to SOL
 *
 * @param lamports Lamports amount
 * @returns SOL amount as string
 */
export function lamportsToSol(lamports: string | number): string {
  const lamportNum = typeof lamports === 'string' ? parseFloat(lamports) : lamports;

  if (isNaN(lamportNum)) {
    throw new Error(`Invalid lamports: ${lamports}`);
  }

  return (lamportNum / 1e9).toFixed(9);
}

/**
 * Convert SOL to lamports
 *
 * @param sol SOL amount
 * @returns Lamports amount as string
 */
export function solToLamports(sol: string | number): string {
  const solNum = typeof sol === 'string' ? parseFloat(sol) : sol;

  if (isNaN(solNum)) {
    throw new Error(`Invalid SOL amount: ${sol}`);
  }

  return Math.floor(solNum * 1e9).toString();
}

/**
 * Convert token amount using decimals
 *
 * @param amount Display amount
 * @param decimals Token decimals
 * @returns Amount in atomic units
 */
export function toAtomicUnits(amount: string | number, decimals: number): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  if (decimals < 0 || decimals > 18) {
    throw new Error(`Invalid decimals: ${decimals}`);
  }

  return Math.floor(amountNum * Math.pow(10, decimals)).toString();
}

/**
 * Convert atomic units to display amount
 *
 * @param amount Amount in atomic units
 * @param decimals Token decimals
 * @returns Display amount as string
 */
export function fromAtomicUnits(amount: string | number, decimals: number): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  if (decimals < 0 || decimals > 18) {
    throw new Error(`Invalid decimals: ${decimals}`);
  }

  return (amountNum / Math.pow(10, decimals)).toString();
}

/**
 * Format amount with specified decimal places
 *
 * @param amount Amount to format
 * @param decimalPlaces Decimal places to show
 * @returns Formatted amount as string
 */
export function formatAmount(amount: string | number, decimalPlaces: number = 2): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    return '0';
  }

  return amountNum.toFixed(Math.max(0, decimalPlaces));
}

/**
 * Format amount as currency (with commas for thousands)
 *
 * @param amount Amount to format
 * @param decimalPlaces Decimal places to show
 * @returns Formatted currency string
 */
export function formatCurrency(amount: string | number, decimalPlaces: number = 2): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    return '0';
  }

  return amountNum.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Calculate effective price (output per input)
 *
 * @param inputAmount Input amount
 * @param outputAmount Output amount
 * @param inputDecimals Input token decimals
 * @param outputDecimals Output token decimals
 * @returns Effective price
 */
export function calculateEffectivePrice(
  inputAmount: string | number,
  outputAmount: string | number,
  inputDecimals: number,
  outputDecimals: number
): string {
  const inAmount = typeof inputAmount === 'string' ? parseFloat(inputAmount) : inputAmount;
  const outAmount = typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount;

  if (inAmount === 0) {
    return '0';
  }

  // Convert to display units
  const inDisplay = inAmount / Math.pow(10, inputDecimals);
  const outDisplay = outAmount / Math.pow(10, outputDecimals);

  // Price = output / input
  const price = outDisplay / inDisplay;

  return price.toFixed(8);
}

/**
 * Check if swap is economical (considering slippage and fees)
 *
 * @param outputAmount Expected output amount
 * @param minimumAmount Minimum required amount
 * @param maxSlippageBps Maximum acceptable slippage in basis points
 * @returns True if swap is economical
 */
export function isEconomicalSwap(
  outputAmount: string | number,
  minimumAmount: string | number,
  maxSlippageBps: number = 500 // 5%
): boolean {
  const outAmount = typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount;
  const minAmount = typeof minimumAmount === 'string' ? parseFloat(minimumAmount) : minimumAmount;

  if (outAmount === 0) {
    return false;
  }

  // Calculate actual slippage
  const actualSlippage = ((outAmount - minAmount) / outAmount) * 10000;

  return actualSlippage <= maxSlippageBps;
}

/**
 * Calculate slippage tolerance basis points from percentage
 *
 * @param percentageSlippage Slippage as percentage (e.g., 0.5 for 0.5%)
 * @returns Slippage in basis points
 */
export function percentToBps(percentageSlippage: number): number {
  return Math.round(percentageSlippage * 100);
}

/**
 * Calculate percentage slippage from basis points
 *
 * @param bps Slippage in basis points (e.g., 50 for 0.5%)
 * @returns Slippage as percentage
 */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}
