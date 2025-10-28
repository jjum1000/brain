import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowLeft, Loader2, AlertCircle, TrendingUp, DollarSign, Percent, Activity } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { FirebaseTimestamp } from '@/types/firestore';
import type { Transaction } from '@/types/firestore';

/**
 * Portfolio Page Component
 * Displays user's investment portfolio with transaction history
 * Shows investment tracking, returns, and transaction details
 */
export function Portfolio() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { transactions, loading, error } = useTransactions(100);
  const [filterType, setFilterType] = useState<string>('');

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'completed') {
        if (tx.type === 'deposit') {
          totalDeposited += tx.amount;
        } else if (tx.type === 'withdraw') {
          totalWithdrawn += tx.amount;
        } else if (tx.type === 'profit') {
          totalProfit += tx.amount;
        } else if (tx.type === 'loss') {
          totalLoss += tx.amount;
        }
      }
    });

    const currentBalance = totalDeposited - totalWithdrawn + totalProfit - totalLoss;
    const totalReturn = totalProfit - totalLoss;
    const roi = totalDeposited > 0 ? ((totalReturn / totalDeposited) * 100).toFixed(2) : '0.00';

    return {
      totalDeposited,
      totalWithdrawn,
      totalProfit,
      totalLoss,
      currentBalance,
      totalReturn,
      roi,
    };
  }, [transactions]);

  // Filter transactions by type
  const filteredTransactions = useMemo(() => {
    if (!filterType) {
      return transactions;
    }
    return transactions.filter((tx) => tx.type === filterType);
  }, [transactions, filterType]);

  const typeColor: Record<string, string> = {
    deposit: 'bg-green-600',
    withdraw: 'bg-blue-600',
    profit: 'bg-emerald-600',
    loss: 'bg-red-600',
  };

  const statusColor: Record<string, string> = {
    completed: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Alert className="bg-red-600/20 border-red-600">
            <AlertDescription className="text-red-200">
              Please sign in to view your portfolio
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-slate-300">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Alert className="bg-red-600/20 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-2">
              {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-slate-400">Track your investments and returns</p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Balance */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-400">
                ${portfolioStats.currentBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          {/* Total Deposited */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Deposited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">
                ${portfolioStats.totalDeposited.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          {/* Total Return */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Total Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${portfolioStats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${portfolioStats.totalReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-2">ROI: {portfolioStats.roi}%</p>
            </CardContent>
          </Card>

          {/* Profit vs Loss */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Profit</p>
                  <p className="text-lg font-bold text-green-400">
                    ${portfolioStats.totalProfit.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Loss</p>
                  <p className="text-lg font-bold text-red-400">
                    ${portfolioStats.totalLoss.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white">Transaction History</CardTitle>
                <CardDescription className="text-slate-400">
                  All deposits, withdrawals, and profit/loss transactions
                </CardDescription>
              </div>

              {/* Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-slate-300">
                  <SelectValue placeholder="All Transactions" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">All Transactions</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdraw">Withdrawals</SelectItem>
                  <SelectItem value="profit">Profits</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Amount</TableHead>
                      <TableHead className="text-slate-300">Currency</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                      <TableHead className="text-slate-300">Strategy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx: Transaction) => (
                      <TableRow key={tx.id} className="border-slate-700 hover:bg-slate-800/30">
                        <TableCell>
                          <Badge className={`${typeColor[tx.type] || 'bg-slate-700'} hover:opacity-90 capitalize`}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          ${tx.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-slate-400 uppercase">{tx.currency}</TableCell>
                        <TableCell>
                          <span className={`${statusColor[tx.status] || 'text-slate-400'} font-semibold capitalize`}>
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {FirebaseTimestamp.toLocaleDateString(tx.createdAt)}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {tx.strategyId ? (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => navigate(`/strategy/${tx.strategyId}`)}
                              className="text-amber-500 hover:text-amber-400 p-0"
                            >
                              View
                            </Button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allocation Summary */}
        {transactions.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Completed Transactions</p>
                  <p className="text-2xl font-bold text-green-400">
                    {transactions.filter((tx) => tx.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Pending Transactions</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {transactions.filter((tx) => tx.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Failed Transactions</p>
                  <p className="text-2xl font-bold text-red-400">
                    {transactions.filter((tx) => tx.status === 'failed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
