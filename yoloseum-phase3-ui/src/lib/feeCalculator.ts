/**
 * Fee Calculator Module
 * Calculates platform performance fees and related metrics
 */

export interface FeeCalculationResult {
  totalProfit: number;
  performanceFee: number; // 20% of profit
  netProfit: number;
  feePercentage: number;
}

/**
 * Calculate performance fee (20%) on profits
 * Only charges fees on positive returns
 * @param totalProfit - Total profit amount
 * @param feePercentage - Fee percentage (default: 0.2 = 20%)
 * @returns Fee calculation result with gross, fee, and net amounts
 */
export function calculatePerformanceFee(
  totalProfit: number,
  feePercentage: number = 0.2
): FeeCalculationResult {
  // No fees on zero or negative returns
  if (totalProfit <= 0) {
    return {
      totalProfit,
      performanceFee: 0,
      netProfit: totalProfit,
      feePercentage,
    };
  }

  const performanceFee = totalProfit * feePercentage;
  const netProfit = totalProfit - performanceFee;

  return {
    totalProfit,
    performanceFee,
    netProfit,
    feePercentage,
  };
}

/**
 * Calculate cumulative fees from multiple earnings
 * @param earnings - Array of earning amounts
 * @param feePercentage - Fee percentage (default: 0.2 = 20%)
 * @returns Total fees collected
 */
export function calculateCumulativeFees(
  earnings: number[],
  feePercentage: number = 0.2
): number {
  return earnings.reduce((total, earning) => {
    if (earning > 0) {
      total += earning * feePercentage;
    }
    return total;
  }, 0);
}

/**
 * Calculate required gross profit to achieve target net profit after fees
 * Formula: netProfit = totalProfit * (1 - feePercentage)
 * Therefore: totalProfit = netProfit / (1 - feePercentage)
 * @param targetNetProfit - Target net profit (after fees)
 * @param feePercentage - Fee percentage (default: 0.2 = 20%)
 * @returns Required gross profit
 */
export function calculateBreakEvenProfit(
  targetNetProfit: number,
  feePercentage: number = 0.2
): number {
  if (feePercentage >= 1) {
    return Infinity; // Fee is 100% or more, impossible to achieve net profit
  }
  return targetNetProfit / (1 - feePercentage);
}

/**
 * Calculate fee for a specific amount
 * @param amount - Transaction/profit amount
 * @param feePercentage - Fee percentage (default: 0.2 = 20%)
 * @returns Fee amount
 */
export function calculateFeeAmount(
  amount: number,
  feePercentage: number = 0.2
): number {
  if (amount <= 0) return 0;
  return amount * feePercentage;
}

/**
 * Get fee description text
 * @param feePercentage - Fee percentage as decimal (0.2 = 20%)
 * @returns Formatted fee percentage string
 */
export function getFeePercentageText(feePercentage: number): string {
  return `${(feePercentage * 100).toFixed(0)}%`;
}

/**
 * Calculate average fee from multiple transactions
 * @param transactions - Array of transactions with amounts and fees
 * @returns Average fee percentage
 */
export function calculateAverageFeePercentage(
  transactions: Array<{ amount: number; fee: number }>
): number {
  if (transactions.length === 0) return 0;

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);

  if (totalAmount === 0) return 0;
  return totalFees / totalAmount;
}
