import { Trophy, Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLeaderboard } from '@/hooks/useLeaderboard';

type LeaderboardPeriod = 'weekly' | 'monthly' | 'seasonal';

export function Leaderboard() {
  const {
    rankings,
    leaderboardData,
    currentPeriod,
    setPeriod,
    loading,
    error,
  } = useLeaderboard('weekly');

  const periods: LeaderboardPeriod[] = ['weekly', 'monthly', 'seasonal'];

  // Get medal emoji based on rank
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getPeriodLabel = (period: LeaderboardPeriod): string => {
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-slate-400">Top traders in the YOLOSEUM community</p>
        </div>

        {/* Period Selection */}
        <div className="flex gap-3 mb-6">
          {periods.map((period) => (
            <Button
              key={period}
              onClick={() => setPeriod(period)}
              variant={currentPeriod === period ? 'default' : 'outline'}
              className={`${
                currentPeriod === period
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {getPeriodLabel(period as LeaderboardPeriod)}
            </Button>
          ))}
        </div>

        {error && (
          <Alert className="mb-6 bg-red-600/20 border-red-600">
            <AlertDescription className="text-red-200">{error.message}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="text-slate-300">Loading leaderboard...</p>
            </div>
          </div>
        ) : rankings.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No traders found for this period</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Rankings</CardTitle>
              <CardDescription className="text-slate-400">
                {getPeriodLabel(currentPeriod as LeaderboardPeriod)} Rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Rank</TableHead>
                      <TableHead className="text-slate-300">Trader</TableHead>
                      <TableHead className="text-slate-300">ROI</TableHead>
                      <TableHead className="text-slate-300">Win Rate</TableHead>
                      <TableHead className="text-slate-300">Wins</TableHead>
                      <TableHead className="text-slate-300">Total Trades</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((entry) => {
                      const medal = getMedalEmoji(entry.rank);

                      return (
                        <TableRow key={entry.traderId} className="border-slate-700 hover:bg-slate-700/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {medal && <span className="text-lg">{medal}</span>}
                              <span className="font-bold text-white">#{entry.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-amber-600 text-white text-xs">
                                  {entry.traderName?.slice(0, 2).toUpperCase() || 'TR'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-white">{entry.traderName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 font-semibold">{entry.roi.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(entry.winRate, 100)} className="w-16 h-2" />
                              <span className="text-slate-300 text-sm w-10">{entry.winRate.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300 font-medium">{entry.wins}</TableCell>
                          <TableCell className="text-slate-300">{entry.totalTrades}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Stats */}
        {leaderboardData && (
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">Total Traders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{leaderboardData.totalTraders}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">Total Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{leaderboardData.totalStrategies}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">Total Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{leaderboardData.totalSupporters}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${((leaderboardData.totalVolume || 0) / 1000000).toFixed(1)}M
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
