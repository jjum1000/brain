import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, AlertCircle, Copy, Check, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/lib/firebase';
import { FirebaseTimestamp } from '@/types/firestore';
import { DepositSection } from '@/components/deposit/DepositSection';
import type { Strategy } from '@/types/firestore';

/**
 * Strategy Detail Page Component
 * Displays comprehensive information about a specific trading strategy
 * Includes performance metrics, rules, and execution details
 */
export function StrategyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch strategy details
  useEffect(() => {
    const fetchStrategy = async () => {
      if (!id) {
        setError('Strategy ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const strategyRef = doc(db, 'strategies', id);
        const docSnap = await getDoc(strategyRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStrategy({
            id: docSnap.id,
            ...data,
          } as Strategy);
          setError(null);
        } else {
          setError(`Strategy with ID "${id}" not found`);
          setStrategy(null);
        }
      } catch (err) {
        console.error('Error fetching strategy:', err);
        setError('Failed to load strategy details');
        setStrategy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-slate-300">Loading strategy details...</p>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/strategies')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Strategies
          </Button>

          <Alert className="bg-red-600/20 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-2">
              {error || 'Strategy not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const categoryColor: Record<string, string> = {
    momentum: 'bg-blue-600',
    contrarian: 'bg-purple-600',
    scalping: 'bg-green-600',
    grid: 'bg-yellow-600',
    hedging: 'bg-red-600',
  };

  const riskColor: Record<string, string> = {
    low: 'bg-green-600',
    medium: 'bg-yellow-600',
    high: 'bg-red-600',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/strategies')}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Strategies
        </Button>

        {/* Strategy Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Name and Trader */}
              <div className="flex-1">
                <CardTitle className="text-4xl text-white mb-2">{strategy.name}</CardTitle>
                <CardDescription className="text-slate-400 text-base mb-4">
                  By <span className="text-amber-400">{strategy.traderName}</span>
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${categoryColor[strategy.category] || 'bg-slate-700'} hover:opacity-90`}>
                    {strategy.category}
                  </Badge>
                  <Badge className={`${riskColor[strategy.risk] || 'bg-slate-700'} hover:opacity-90`}>
                    {strategy.risk}
                  </Badge>
                  <Badge
                    className={`${
                      strategy.execution?.status === 'active'
                        ? 'bg-green-600'
                        : strategy.execution?.status === 'paused'
                          ? 'bg-yellow-600'
                          : 'bg-slate-600'
                    } hover:opacity-90`}
                  >
                    {strategy.execution?.status}
                  </Badge>
                </div>
              </div>

              {/* Right: Subscribe Button */}
              <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 h-auto text-lg">
                Subscribe Strategy
              </Button>
            </div>

            {/* Description */}
            {strategy.description && (
              <CardDescription className="text-slate-400 mt-6 text-base">{strategy.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current ROI */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Current ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-400">
                  {strategy.performance?.currentROI.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-400">
                  {strategy.performance?.winRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {strategy.performance?.totalTrades} total trades
              </p>
            </CardContent>
          </Card>

          {/* Sharpe Ratio */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Sharpe Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-400">
                  {strategy.performance?.sharpeRatio.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Risk-adjusted returns</p>
            </CardContent>
          </Card>

          {/* Max Drawdown */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Max Drawdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-400">
                  {strategy.performance?.maxDrawdown.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Peak-to-trough decline</p>
            </CardContent>
          </Card>
        </div>

        {/* Execution Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Value Locked */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Value Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                ${(strategy.execution?.tvl || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>

          {/* Supporters */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Supporters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{strategy.execution?.supporterCount || 0}</p>
            </CardContent>
          </Card>

          {/* Network */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white capitalize">{strategy.execution?.network}</p>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Section */}
        {strategy.execution?.smartContractAddress && (
          <DepositSection vaultAddress={strategy.execution.smartContractAddress} />
        )}

        {/* Smart Contract */}
        {strategy.execution?.smartContractAddress && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Smart Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Contract Address</p>
                  <p className="text-sm text-amber-400 font-mono break-all">
                    {strategy.execution.smartContractAddress}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(strategy.execution?.smartContractAddress || '')}
                  className="ml-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategy Rules */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Strategy Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entry Condition */}
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Entry Condition</h4>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm font-mono break-words">
                    {strategy.rules?.entryCondition || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Exit Condition */}
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Exit Condition</h4>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm font-mono break-words">
                    {strategy.rules?.exitCondition || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Stop Loss */}
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Stop Loss</h4>
                <p className="text-2xl font-bold text-red-400">{strategy.rules?.stopLoss}%</p>
              </div>

              {/* Take Profit */}
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Take Profit</h4>
                <p className="text-2xl font-bold text-green-400">{strategy.rules?.takeProfit}%</p>
              </div>

              {/* Max Position */}
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Max Position Size</h4>
                <p className="text-2xl font-bold text-amber-400">{strategy.rules?.maxPosition}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance History */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Period Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Period</TableHead>
                    <TableHead className="text-slate-300 text-right">ROI</TableHead>
                    <TableHead className="text-slate-300 text-right">Win Rate</TableHead>
                    <TableHead className="text-slate-300 text-right">Total Trades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">30-Day ROI</TableCell>
                    <TableCell className="text-green-400 text-right font-semibold">
                      {strategy.performance?.roi30d.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-white text-right">-</TableCell>
                    <TableCell className="text-white text-right">-</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">90-Day ROI</TableCell>
                    <TableCell className="text-green-400 text-right font-semibold">
                      {strategy.performance?.roi90d.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-white text-right">-</TableCell>
                    <TableCell className="text-white text-right">-</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Overall</TableCell>
                    <TableCell className="text-green-400 text-right font-semibold">
                      {strategy.performance?.currentROI.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-blue-400 text-right font-semibold">
                      {strategy.performance?.winRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-white text-right font-semibold">
                      {strategy.performance?.totalTrades}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Backtesting Results */}
        {strategy.backtesting && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Backtesting Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Backtest Period</p>
                  <p className="text-lg font-semibold text-white capitalize">{strategy.backtesting.period}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Accuracy</p>
                  <p className="text-lg font-semibold text-green-400">{strategy.backtesting.accuracy.toFixed(1)}%</p>
                </div>
              </div>
              {strategy.backtesting.results && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Detailed Results</p>
                  <pre className="text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(strategy.backtesting.results, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Strategy Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Strategy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Created</p>
              <p className="text-sm text-slate-200">
                {FirebaseTimestamp.toLocaleDateString(strategy.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Last Updated</p>
              <p className="text-sm text-slate-200">
                {FirebaseTimestamp.toLocaleDateString(strategy.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Performance Last Updated</p>
              <p className="text-sm text-slate-200">
                {FirebaseTimestamp.toLocaleDateString(strategy.performance?.lastUpdated)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
