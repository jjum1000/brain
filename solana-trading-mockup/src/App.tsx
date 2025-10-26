import { useState } from 'react'
import { TrendingUp, Wallet, BarChart3, Zap, Shield, Activity, ChevronLeft, Play, TrendingDown, TrendingUp as TrendingUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('strategies')
  const [walletConnected, setWalletConnected] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)

  const strategies = [
    {
      id: 1,
      name: 'Luna Trend Following',
      creator: 'Crypto King',
      apy: 28.5,
      tvl: 1234567,
      users: 342,
      risk: 'Medium',
      riskColor: 'bg-yellow-100 text-yellow-800',
      returns24h: '+2.3%',
      video: 'https://youtube.com/embed/dQw4w9WgXcQ',
      description: 'Trend following strategy using 50/200 MA crossover with volume confirmation',
      youtuber: 'Crypto King',
      subscribers: '500K',
      views: '1.2M',
      uploadDate: '2025-10-20',
      winRate: 65.5,
      totalTrades: 342,
      avgProfit: 150.25,
      mdd: 12.5,
      sharpeRatio: 1.8
    },
    {
      id: 2,
      name: 'Arbitrage Bot Pro',
      creator: 'DeFi Master',
      apy: 45.2,
      tvl: 2567890,
      users: 567,
      risk: 'Low',
      riskColor: 'bg-green-100 text-green-800',
      returns24h: '+3.8%',
      video: 'https://youtube.com/embed/dQw4w9WgXcQ',
      description: 'Cross-DEX arbitrage strategy exploiting price discrepancies on Solana',
      youtuber: 'DeFi Master',
      subscribers: '750K',
      views: '2.1M',
      uploadDate: '2025-10-18',
      winRate: 78.3,
      totalTrades: 567,
      avgProfit: 245.80,
      mdd: 8.2,
      sharpeRatio: 2.4
    },
    {
      id: 3,
      name: 'High Volatility Play',
      creator: 'Risk Taker',
      apy: 62.1,
      tvl: 856432,
      users: 193,
      risk: 'High',
      riskColor: 'bg-red-100 text-red-800',
      returns24h: '+5.2%',
      video: 'https://youtube.com/embed/dQw4w9WgXcQ',
      description: 'Leveraged trading strategy for high volatility coins with risk management',
      youtuber: 'Risk Taker',
      subscribers: '320K',
      views: '890K',
      uploadDate: '2025-10-22',
      winRate: 52.1,
      totalTrades: 193,
      avgProfit: 512.45,
      mdd: 28.5,
      sharpeRatio: 1.2
    },
    {
      id: 4,
      name: 'Market Maker Strategy',
      creator: 'Liquidity Pro',
      apy: 34.8,
      tvl: 1876543,
      users: 421,
      risk: 'Low',
      riskColor: 'bg-green-100 text-green-800',
      returns24h: '+1.9%',
      video: 'https://youtube.com/embed/dQw4w9WgXcQ',
      description: 'Market making strategy providing liquidity on major trading pairs',
      youtuber: 'Liquidity Pro',
      subscribers: '600K',
      views: '1.8M',
      uploadDate: '2025-10-19',
      winRate: 71.2,
      totalTrades: 421,
      avgProfit: 198.50,
      mdd: 9.8,
      sharpeRatio: 2.1
    },
  ]

  const tradeHistory = [
    { id: 1, date: '2025-10-27 14:32', type: 'BUY', price: 155.23, quantity: 100, pnl: 320.50, pnlPercent: 2.1, status: 'Completed' },
    { id: 2, date: '2025-10-27 12:15', type: 'SELL', price: 158.45, quantity: 100, pnl: 320.50, pnlPercent: 2.1, status: 'Completed' },
    { id: 3, date: '2025-10-27 10:08', type: 'BUY', price: 152.50, quantity: 150, pnl: 485.75, pnlPercent: 2.5, status: 'Completed' },
    { id: 4, date: '2025-10-26 16:42', type: 'SELL', price: 161.30, quantity: 150, pnl: 575.25, pnlPercent: 3.2, status: 'Completed' },
    { id: 5, date: '2025-10-26 14:20', type: 'BUY', price: 149.80, quantity: 200, pnl: 695.80, pnlPercent: 2.8, status: 'Completed' },
  ]

  const portfolioData = {
    totalValue: 45230.50,
    totalGain: 3245.75,
    gainPercent: 7.7,
    vaults: [
      { name: 'Luna Trend Following', value: 15000, gain: 1150, percent: 7.7 },
      { name: 'Arbitrage Bot Pro', value: 20000, gain: 1890, percent: 9.5 },
      { name: 'Market Maker Strategy', value: 10230.50, gain: 205.75, percent: 2.0 }
    ]
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  // Get selected strategy data
  const currentStrategy = selectedStrategy ? strategies.find(s => s.id === selectedStrategy) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {selectedStrategy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStrategy(null)}
                className="mr-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SolanaVault</h1>
              {selectedStrategy && currentStrategy ? (
                <p className="text-xs text-slate-400">{currentStrategy.name}</p>
              ) : (
                <p className="text-xs text-slate-400">Non-Custodial Trading Platform</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => setWalletConnected(!walletConnected)}
            className={walletConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {walletConnected ? 'Connected' : 'Connect Wallet'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedStrategy && currentStrategy ? (
          // Strategy Details Page
          <div className="space-y-8">
            {/* Strategy Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{currentStrategy.name}</h2>
                  <p className="text-slate-300">{currentStrategy.description}</p>
                </div>
                <Badge className={`${currentStrategy.riskColor} text-lg px-3 py-1`}>
                  {currentStrategy.risk}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-slate-400">APY</p>
                  <p className="text-2xl font-bold text-green-400">{currentStrategy.apy}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">24h Return</p>
                  <p className="text-2xl font-bold text-blue-400">{currentStrategy.returns24h}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">TVL</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentStrategy.tvl)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Users</p>
                  <p className="text-2xl font-bold text-purple-400">{currentStrategy.users}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Creator</p>
                  <p className="text-xl font-bold">{currentStrategy.creator}</p>
                </div>
              </div>
            </div>

            {/* YouTube Video Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                  <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={currentStrategy.video}
                      title="YouTube video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </Card>
              </div>

              {/* Creator Info */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3" />
                    <h3 className="font-bold text-lg">{currentStrategy.youtuber}</h3>
                    <p className="text-sm text-slate-400">{currentStrategy.subscribers} subscribers</p>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Video Views</span>
                        <span className="font-semibold">{currentStrategy.views}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Upload Date</span>
                        <span className="font-semibold">{currentStrategy.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                    <Play className="w-4 h-4" />
                    Deposit Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chart & Trade History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Placeholder */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>SOL/USDC Price Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-96 bg-slate-900/50 rounded-lg flex items-center justify-center border border-dashed border-slate-700">
                      <div className="text-center">
                        <svg className="w-48 h-32 mx-auto text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M3 12h18M3 6h18M3 18h18M6 9v6M9 8v8M12 7v10M15 9v6M18 8v8" />
                        </svg>
                        <p className="text-slate-400">Chart data loading...</p>
                        <p className="text-sm text-slate-500 mt-1">TradingView chart would display here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Stats */}
              <div className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-base">Performance Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-400">{currentStrategy.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total Trades</p>
                      <p className="text-2xl font-bold">{currentStrategy.totalTrades}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Avg Profit / Trade</p>
                      <p className="text-2xl font-bold text-green-400">${currentStrategy.avgProfit.toFixed(2)}</p>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-xs text-slate-400">Max Drawdown (MDD)</p>
                      <p className="text-2xl font-bold text-red-400">{currentStrategy.mdd}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-blue-400">{currentStrategy.sharpeRatio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Trade History Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Recent Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-slate-700/50">
                        <TableHead className="text-slate-300">Date/Time</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Price</TableHead>
                        <TableHead className="text-slate-300">Quantity</TableHead>
                        <TableHead className="text-slate-300">P&L</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tradeHistory.map((trade) => (
                        <TableRow key={trade.id} className="hover:bg-slate-700/30">
                          <TableCell className="text-slate-300">{trade.date}</TableCell>
                          <TableCell>
                            <Badge className={trade.type === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                              {trade.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">${trade.price.toFixed(2)}</TableCell>
                          <TableCell className="text-slate-300">{trade.quantity}</TableCell>
                          <TableCell className="font-semibold text-green-400">
                            +${trade.pnl.toFixed(2)} ({trade.pnlPercent}%)
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-slate-600">{trade.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main Strategies Page
          <>
            {/* Hero Section */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-4">Automated Trading on Solana</h2>
              <p className="text-lg text-slate-300 max-w-2xl">
                Invest in transparent, non-custodial strategies powered by smart contracts.
                Complete control, zero middlemen, maximum returns.
              </p>
            </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="strategies" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Strategy Ranking
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Your Portfolio
            </TabsTrigger>
          </TabsList>

          {/* Strategy Ranking Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{strategy.name}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">by {strategy.creator}</p>
                      </div>
                      <Badge className={`${strategy.riskColor} whitespace-nowrap`}>
                        {strategy.risk}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">APY</p>
                        <p className="text-2xl font-bold text-green-400">{strategy.apy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">24h Return</p>
                        <p className="text-2xl font-bold text-blue-400">{strategy.returns24h}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Users</p>
                        <p className="text-2xl font-bold text-purple-400">{strategy.users}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Value Locked (TVL)</p>
                      <p className="text-xl font-bold">{formatCurrency(strategy.tvl)}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 hover:bg-slate-700"
                        onClick={() => setSelectedStrategy(strategy.id)}
                      >
                        Learn More
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Deposit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {walletConnected ? (
              <>
                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-slate-300 mb-2">Total Portfolio Value</p>
                      <p className="text-3xl font-bold">${portfolioData.totalValue.toFixed(2)}</p>
                      <p className="text-green-400 text-sm mt-2">↑ {portfolioData.gainPercent}% (${portfolioData.totalGain.toFixed(2)})</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-green-400" />
                        <div>
                          <p className="text-xs text-slate-400">Active Strategies</p>
                          <p className="text-2xl font-bold">{portfolioData.vaults.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="text-xs text-slate-400">Your Control</p>
                          <p className="text-lg font-bold">Non-Custodial</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vault Details */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Your Vaults</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {portfolioData.vaults.map((vault, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                          <div>
                            <p className="font-semibold">{vault.name}</p>
                            <p className="text-sm text-slate-400">Value: ${vault.value.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-400">+{vault.percent}%</p>
                            <p className="text-sm text-slate-400">${vault.gain.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-12 pb-12 text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-slate-400 mb-6">Connect your Phantom or Solflare wallet to view your portfolio</p>
                  <Button
                    onClick={() => setWalletConnected(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
            <Shield className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold mb-2">Non-Custodial</h3>
            <p className="text-sm text-slate-400">Your private key, your assets. Complete control, zero trust needed.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold mb-2">Automated Trading</h3>
            <p className="text-sm text-slate-400">Smart contracts execute trades automatically based on defined strategies.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
            <Zap className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold mb-2">Solana Speed</h3>
            <p className="text-sm text-slate-400">Fast transactions, low fees. Trade at scale with minimal costs.</p>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-16 py-8 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>© 2025 SolanaVault - Non-Custodial Automated Trading Platform</p>
          <p className="mt-2">Always DYOR. This is not financial advice.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
