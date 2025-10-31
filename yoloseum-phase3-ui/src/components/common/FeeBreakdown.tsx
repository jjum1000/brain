import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { calculatePerformanceFee } from '@/lib/feeCalculator';

/**
 * Fee Breakdown Component
 * Displays visual breakdown of performance fees
 * Shows gross profit, platform fee, and net profit
 */
interface FeeBreakdownProps {
  profit: number;
  feePercentage?: number;
  showLabel?: boolean;
}

export const FeeBreakdown: FC<FeeBreakdownProps> = ({
  profit,
  feePercentage = 0.2,
  showLabel = true,
}) => {
  const { performanceFee, netProfit } = calculatePerformanceFee(
    profit,
    feePercentage
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-6 space-y-3">
        {/* Total Profit */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Total Profit:</span>
          <span className="text-white font-mono">
            {formatCurrency(profit)}
          </span>
        </div>

        {/* Platform Fee */}
        {performanceFee > 0 && (
          <div className="flex justify-between text-sm border-t border-slate-700 pt-3">
            <span className="text-slate-400">
              Platform Fee ({(feePercentage * 100).toFixed(0)}%):
            </span>
            <span className="text-red-400 font-mono">
              -{formatCurrency(performanceFee)}
            </span>
          </div>
        )}

        {/* Net Profit / Your Earnings */}
        <div className="flex justify-between text-sm border-t border-slate-700 pt-3">
          <span className="text-slate-300 font-semibold">
            {showLabel ? 'Your Earnings:' : 'Net Amount:'}
          </span>
          <span className={netProfit >= 0 ? 'text-green-400 font-semibold font-mono' : 'text-red-400 font-semibold font-mono'}>
            {formatCurrency(netProfit)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
