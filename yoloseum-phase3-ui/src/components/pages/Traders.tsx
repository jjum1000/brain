import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Search, Star, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTraders } from '@/hooks/useTraders';

/**
 * Traders List Page Component
 * Displays a grid of verified traders with filtering and search capabilities
 */
export function Traders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'followers' | 'rating' | 'roi'>('followers');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const { traders, loading, error } = useTraders(50, verifiedOnly);

  // Filter and sort traders
  const filteredTraders = useMemo(() => {
    let filtered = traders.filter((trader) =>
      trader.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trader.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          return (b.followerCount ?? 0) - (a.followerCount ?? 0);
        case 'rating':
          return (b.rating?.averageRating ?? 0) - (a.rating?.averageRating ?? 0);
        case 'roi':
          return (b.performance?.avgROI ?? 0) - (a.performance?.avgROI ?? 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [traders, searchQuery, sortBy]);

  const handleTraderClick = (traderId: string) => {
    navigate(`/trader/${traderId}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Top Traders</h1>
          <p className="text-slate-400">Follow and learn from the best traders in our community</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-600/20 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-2">{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search traders by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                variant={verifiedOnly ? 'default' : 'outline'}
                className={`${
                  verifiedOnly
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Verified Only
              </Button>
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-slate-400 flex items-center">Sort by:</span>
              <Button
                onClick={() => setSortBy('followers')}
                variant={sortBy === 'followers' ? 'default' : 'outline'}
                size="sm"
                className={`${
                  sortBy === 'followers'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4 mr-1" />
                Followers
              </Button>
              <Button
                onClick={() => setSortBy('rating')}
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
                className={`${
                  sortBy === 'rating'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Star className="h-4 w-4 mr-1" />
                Rating
              </Button>
              <Button
                onClick={() => setSortBy('roi')}
                variant={sortBy === 'roi' ? 'default' : 'outline'}
                size="sm"
                className={`${
                  sortBy === 'roi'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                ROI
              </Button>
            </div>
          </div>
        </div>

        {/* Traders Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="text-slate-300">Loading traders...</p>
            </div>
          </div>
        ) : filteredTraders.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {searchQuery ? 'No traders found matching your search' : 'No traders available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTraders.map((trader) => (
              <Card
                key={trader.uid}
                className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer"
                onClick={() => handleTraderClick(trader.uid)}
              >
                <CardHeader>
                  {/* Avatar and Name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={trader.avatar ?? undefined} alt={trader.displayName} />
                        <AvatarFallback className="bg-amber-600 text-white text-sm">
                          {trader.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white truncate">{trader.displayName}</CardTitle>
                        {trader.verification?.status === 'verified' && (
                          <Badge className="mt-1 bg-green-600 hover:bg-green-700 text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {trader.bio && (
                    <CardDescription className="text-slate-400 line-clamp-2">
                      {trader.bio}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Followers */}
                    <div className="bg-slate-900/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Followers</p>
                      <p className="text-sm font-semibold text-white">{trader.followerCount ?? 0}</p>
                    </div>

                    {/* Rating */}
                    <div className="bg-slate-900/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <p className="text-sm font-semibold text-white">
                          {(trader.rating?.averageRating ?? 0).toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="bg-slate-900/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Win Rate</p>
                      <p className="text-sm font-semibold text-green-400">
                        {(trader.performance?.winRate ?? 0).toFixed(1)}%
                      </p>
                    </div>

                    {/* Avg ROI */}
                    <div className="bg-slate-900/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Avg ROI</p>
                      <p className="text-sm font-semibold text-blue-400">
                        {(trader.performance?.avgROI ?? 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Total Trades */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Trades</span>
                    <span className="text-white font-semibold">{trader.performance?.totalTrades ?? 0}</span>
                  </div>

                  {/* Follow Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement follow functionality
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Follow Trader
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Info */}
        {!loading && filteredTraders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Showing {filteredTraders.length} of {traders.length} traders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
