import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStrategies } from '@/hooks/useStrategies';
import type { Strategy } from '@/types/firestore';
import { TraderGridSkeleton } from '@/components/common/Skeletons';

/**
 * Strategies List Page Component
 * Displays grid of trading strategies with filtering and search
 * Supports filtering by category, risk level, and status
 */
export function Strategies() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { strategies, loading, error } = useStrategies(
    {
      category: selectedCategory as 'momentum' | 'contrarian' | 'scalping' | 'grid' | 'hedging' | undefined,
      risk: selectedRisk as 'low' | 'medium' | 'high' | undefined,
      status: selectedStatus as 'active' | 'paused' | 'closed' | undefined,
    },
    50
  );

  // Filter strategies by search query
  const filteredStrategies = useMemo(() => {
    return strategies.filter(
      (strategy) =>
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.traderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [strategies, searchQuery]);

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

  const statusColor: Record<string, string> = {
    active: 'bg-green-600',
    paused: 'bg-yellow-600',
    closed: 'bg-slate-600',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Strategies</h1>
            <p className="text-slate-400">Discover and follow profitable trading strategies</p>
          </div>
          <TraderGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
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
          <h1 className="text-4xl font-bold text-white mb-2">Trading Strategies</h1>
          <p className="text-slate-400">Discover and follow top-performing trading strategies</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  placeholder="Search strategies by name or trader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="contrarian">Contrarian</SelectItem>
                    <SelectItem value="scalping">Scalping</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="hedging">Hedging</SelectItem>
                  </SelectContent>
                </Select>

                {/* Risk Filter */}
                <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategies Grid */}
        {filteredStrategies.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">
              {searchQuery || selectedCategory || selectedRisk || selectedStatus
                ? 'No strategies match your search criteria'
                : 'No strategies available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStrategies.map((strategy: Strategy) => (
              <Card
                key={strategy.id}
                className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/strategy/${strategy.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-1">{strategy.name}</CardTitle>
                      <CardDescription className="text-slate-400 text-sm">
                        By {strategy.traderName}
                      </CardDescription>
                    </div>
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${categoryColor[strategy.category] || 'bg-slate-700'} hover:opacity-90`}>
                      {strategy.category}
                    </Badge>
                    <Badge className={`${riskColor[strategy.risk] || 'bg-slate-700'} hover:opacity-90`}>
                      {strategy.risk}
                    </Badge>
                    <Badge className={`${statusColor[strategy.execution?.status] || 'bg-slate-700'} hover:opacity-90`}>
                      {strategy.execution?.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-slate-400 text-sm line-clamp-2">{strategy.description}</p>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current ROI</p>
                      <p className="text-lg font-bold text-green-400">
                        {strategy.performance?.currentROI.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                      <p className="text-lg font-bold text-blue-400">
                        {strategy.performance?.winRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">TVL</p>
                      <p className="text-sm font-semibold text-slate-300">
                        ${(strategy.execution?.tvl || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Supporters</p>
                      <p className="text-sm font-semibold text-slate-300">
                        {strategy.execution?.supporterCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Sharpe & Drawdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Sharpe Ratio</p>
                      <p className="text-sm font-semibold text-purple-400">
                        {strategy.performance?.sharpeRatio.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Max Drawdown</p>
                      <p className="text-sm font-semibold text-red-400">
                        {strategy.performance?.maxDrawdown.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/strategy/${strategy.id}`);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-4"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredStrategies.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Showing {filteredStrategies.length} of {strategies.length} strategies
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
