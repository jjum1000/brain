import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Activity,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { CardGridSkeleton, TableSkeleton } from '@/components/common/Skeletons';

const ITEMS_PER_PAGE = 10;

export function Dashboard() {
  const { user: authUser } = useAuth();
  const { userProfile, loading: profileLoading, error: profileError } = useUserProfile();
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const [currentPage, setCurrentPage] = useState(1);

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Alert className="bg-amber-600/20 border-amber-600">
            <AlertDescription className="text-amber-200">
              Please sign in to view your dashboard
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Extract statistics from user profile
  const totalInvested = userProfile?.stats?.totalInvested || 0;
  const totalEarnings = userProfile?.stats?.totalEarnings || 0;
  const followingCount = userProfile?.stats?.followingCount || 0;
  const displayName = userProfile?.displayName || authUser.displayName || 'User';

  const isLoading = profileLoading || transactionsLoading;
  const hasError = profileError || transactionsError;

  // Filter transactions by type
  const deposits = transactions.filter((tx) => tx.type === 'deposit');
  const withdrawals = transactions.filter((tx) => tx.type === 'withdraw');

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  // Reset to first page if current page exceeds total pages
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const statusIcons = {
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const typeIcons = {
    deposit: <ArrowDownRight className="h-3 w-3 mr-1" />,
    withdraw: <ArrowUpRight className="h-3 w-3 mr-1" />,
    profit: <TrendingUp className="h-3 w-3 mr-1" />,
    loss: <ArrowUpRight className="h-3 w-3 mr-1" />,
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {displayName}. Track your investments and portfolio.</p>
        </div>

        {hasError && (
          <Alert className="mb-6 bg-red-600/20 border-red-600">
            <AlertDescription className="text-red-200">
              {profileError?.message || transactionsError?.message || 'Error loading dashboard data'}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <>
            <CardGridSkeleton count={4} />
            <TableSkeleton rowCount={5} />
          </>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Invested</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${typeof totalInvested === 'number' ? totalInvested.toLocaleString() : '0'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <span>Across strategies</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${typeof totalEarnings === 'number' ? totalEarnings.toLocaleString() : '0'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>From supported strategies</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Transactions</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{transactions.length}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <span>{deposits.length} deposits, {withdrawals.length} withdrawals</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Following</CardTitle>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{followingCount}</div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>Traders and strategies</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">
                  Your latest transactions ({transactions.length} total) - Page {currentPage} of {totalPages || 1}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No transactions yet. Start investing to see activity here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Amount (USD)</TableHead>
                          <TableHead className="text-slate-300">Currency</TableHead>
                          <TableHead className="text-slate-300">Date</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTransactions.map((tx) => (
                          <TableRow key={tx.id} className="border-slate-700">
                            <TableCell>
                              <Badge
                                variant={tx.type === 'deposit' || tx.type === 'profit' ? 'default' : 'secondary'}
                                className={
                                  tx.type === 'deposit' || tx.type === 'profit'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                }
                              >
                                {typeIcons[tx.type]}
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">${tx.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-slate-300">{tx.currency}</TableCell>
                            <TableCell className="text-slate-400">
                              {tx.createdAt ? new Date(tx.createdAt.toDate?.() || tx.createdAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>{statusIcons[tx.status]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            {currentPage > 1 && (
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCurrentPage(prev => prev - 1)}
                                  className="cursor-pointer"
                                />
                              </PaginationItem>
                            )}

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={page === currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            {currentPage < totalPages && (
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setCurrentPage(prev => prev + 1)}
                                  className="cursor-pointer"
                                />
                              </PaginationItem>
                            )}
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
