import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Users, Activity, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTraders } from '@/hooks/useTraders';
import type { Trader } from '@/types/firestore';

/**
 * Trader Detail Page Component
 * Displays comprehensive information about a specific trader
 * Includes performance metrics, strategies, and recent activity
 */
export function TraderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all traders and find the one matching the ID
  const { traders } = useTraders(100, false);

  useEffect(() => {
    if (id && traders.length > 0) {
      const foundTrader = traders.find((t) => t.uid === id);
      if (foundTrader) {
        setTrader(foundTrader);
        setError(null);
      } else {
        setError(`Trader with ID "${id}" not found`);
      }
      setLoading(false);
    }
  }, [id, traders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-slate-300">Loading trader details...</p>
        </div>
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/traders')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Traders
          </Button>

          <Alert className="bg-red-600/20 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-2">
              {error || 'Trader not found'}
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
          onClick={() => navigate('/traders')}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Traders
        </Button>

        {/* Trader Profile Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Avatar and Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={trader.avatar ?? undefined} alt={trader.displayName} />
                  <AvatarFallback className="bg-amber-600 text-white text-2xl">
                    {trader.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl text-white mb-2">{trader.displayName}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {trader.verification?.status === 'verified' && (
                      <Badge className="bg-green-600 hover:bg-green-700">✓ Verified</Badge>
                    )}
                    <Badge className="bg-slate-700">Trader</Badge>
                  </div>
                </div>
              </div>

              {/* Right: Follow Button */}
              <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 h-auto text-lg">
                Follow Trader
              </Button>
            </div>

            {/* Bio */}
            {trader.bio && (
              <CardDescription className="text-slate-400 mt-4 text-base">{trader.bio}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Win Rate */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-400">
                  {(trader.performance?.winRate ?? 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {trader.performance?.totalWins ?? 0} wins out of {trader.performance?.totalTrades ?? 0} trades
              </p>
            </CardContent>
          </Card>

          {/* Average ROI */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Average ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-400">
                  {(trader.performance?.avgROI ?? 0).toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Per trade average</p>
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
                  {(trader.performance?.sharpeRatio ?? 0).toFixed(2)}
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
                  {(trader.performance?.maxDrawdown ?? 0).toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Peak-to-trough decline</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Followers */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{trader.followerCount ?? 0}</p>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-amber-400">{(trader.rating?.averageRating ?? 0).toFixed(1)}</p>
                <p className="text-xs text-slate-400">({trader.rating?.ratingCount ?? 0} reviews)</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Trades */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{trader.performance?.totalTrades ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Social Links */}
        {(trader.youtubeUrl || trader.twitterUrl || trader.discordUsername) && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {trader.youtubeUrl && (
                  <a
                    href={trader.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 font-medium flex items-center gap-2"
                  >
                    YouTube
                  </a>
                )}
                {trader.twitterUrl && (
                  <a
                    href={trader.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 font-medium flex items-center gap-2"
                  >
                    Twitter
                  </a>
                )}
                {trader.discordUsername && (
                  <div className="text-amber-500 font-medium flex items-center gap-2">
                    Discord: {trader.discordUsername}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trading Stats Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trading Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Metric</TableHead>
                    <TableHead className="text-slate-300 text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Total Trades</TableCell>
                    <TableCell className="text-white text-right font-semibold">
                      {trader.performance?.totalTrades ?? 0}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Winning Trades</TableCell>
                    <TableCell className="text-green-400 text-right font-semibold">
                      {trader.performance?.totalWins ?? 0}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Losing Trades</TableCell>
                    <TableCell className="text-red-400 text-right font-semibold">
                      {trader.performance?.totalLosses ?? 0}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Win Rate</TableCell>
                    <TableCell className="text-white text-right font-semibold">
                      {(trader.performance?.winRate ?? 0).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Average ROI</TableCell>
                    <TableCell className="text-white text-right font-semibold">
                      {(trader.performance?.avgROI ?? 0).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Sharpe Ratio</TableCell>
                    <TableCell className="text-white text-right font-semibold">
                      {(trader.performance?.sharpeRatio ?? 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-400">Max Drawdown</TableCell>
                    <TableCell className="text-white text-right font-semibold">
                      {(trader.performance?.maxDrawdown ?? 0).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
