import { useState } from 'react';
import {
  Home,
  Trophy,
  Users,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Shield,
  Loader2,
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';

type PageType = 'home' | 'dashboard' | 'leaderboard' | 'traders' | 'profile';

interface Transaction {
  id: string;
  token: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Trader {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  totalTrades: number;
  profit: string;
  rank: number;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, signOut, signInWithGoogle } = useAuth();

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      token: 'BONK',
      type: 'buy',
      amount: '10,000',
      price: '0.00001234',
      timestamp: '2 min ago',
      status: 'completed',
    },
    {
      id: '2',
      token: 'WIF',
      type: 'sell',
      amount: '5,000',
      price: '0.00045678',
      timestamp: '5 min ago',
      status: 'completed',
    },
    {
      id: '3',
      token: 'PEPE',
      type: 'buy',
      amount: '25,000',
      price: '0.00000891',
      timestamp: '12 min ago',
      status: 'pending',
    },
    {
      id: '4',
      token: 'DOGE',
      type: 'sell',
      amount: '1,500',
      price: '0.08234567',
      timestamp: '18 min ago',
      status: 'completed',
    },
  ];

  const mockTraders: Trader[] = [
    {
      id: '1',
      name: 'CryptoWhale',
      avatar: '',
      winRate: 87.5,
      totalTrades: 245,
      profit: '+$127,345',
      rank: 1,
    },
    {
      id: '2',
      name: 'MoonShot',
      avatar: '',
      winRate: 82.3,
      totalTrades: 189,
      profit: '+$98,234',
      rank: 2,
    },
    {
      id: '3',
      name: 'DiamondHands',
      avatar: '',
      winRate: 79.8,
      totalTrades: 312,
      profit: '+$85,678',
      rank: 3,
    },
    {
      id: '4',
      name: 'YoloKing',
      avatar: '',
      winRate: 76.2,
      totalTrades: 156,
      profit: '+$72,145',
      rank: 4,
    },
    {
      id: '5',
      name: 'TokenMaster',
      avatar: '',
      winRate: 74.5,
      totalTrades: 203,
      profit: '+$65,891',
      rank: 5,
    },
  ];

  const navigation = [
    { name: 'Home', page: 'home' as PageType, icon: Home },
    { name: 'Dashboard', page: 'dashboard' as PageType, icon: Activity },
    { name: 'Leaderboard', page: 'leaderboard' as PageType, icon: Trophy },
    { name: 'Traders', page: 'traders' as PageType, icon: Users },
    { name: 'Profile', page: 'profile' as PageType, icon: User },
  ];

  const renderHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold text-amber-500">YOLOSEUM</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-500 ${
                    currentPage === item.page ? 'text-amber-500' : 'text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            ) : user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-slate-300">{user.displayName || user.email}</span>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  className="items-center gap-2 border-slate-700 hover:bg-slate-800 hover:text-amber-500"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signInWithGoogle()}
                className="hidden md:flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-amber-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.page}
                    onClick={() => {
                      setCurrentPage(item.page);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-500 ${
                      currentPage === item.page ? 'text-amber-500' : 'text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
              <Separator className="bg-slate-800" />
              {loading ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  Loading...
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300 px-2">{user.displayName || user.email}</p>
                  <Button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="justify-start gap-2 border-slate-700 hover:bg-slate-800 hover:text-amber-500 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    signInWithGoogle();
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2 bg-amber-600 hover:bg-amber-700 w-full"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="flex justify-center mb-6">
            <Zap className="h-20 w-20 text-amber-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-amber-500">YOLOSEUM</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            The ultimate platform for meme coin trading. Track, compete, and dominate the
            leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setCurrentPage('dashboard')}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-lg px-8"
            >
              Get Started
            </Button>
            <Button
              onClick={() => setCurrentPage('leaderboard')}
              size="lg"
              variant="outline"
              className="border-slate-700 hover:bg-slate-800 hover:text-amber-500 text-lg px-8"
            >
              View Leaderboard
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Target className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-white text-center">Smart Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-center">
                Advanced tools and analytics to make informed trading decisions in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Trophy className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-white text-center">Compete & Win</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-center">
                Climb the leaderboard and earn rewards by showcasing your trading skills.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-white text-center">Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-center">
                Built on Solana blockchain with enterprise-grade security and reliability.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Track your trading performance and recent activity</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$45,231</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>+20.1% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">78.5%</div>
              <Progress value={78.5} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">156</div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <span>32 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Rank</CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">#12</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>Up 3 positions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-slate-400">
              Your latest trading activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Token</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Price</TableHead>
                  <TableHead className="text-slate-300">Time</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-slate-700">
                    <TableCell className="font-medium text-white">{tx.token}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === 'buy' ? 'default' : 'secondary'}
                        className={
                          tx.type === 'buy'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }
                      >
                        {tx.type === 'buy' ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {tx.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{tx.amount}</TableCell>
                    <TableCell className="text-slate-300">{tx.price}</TableCell>
                    <TableCell className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tx.timestamp}
                    </TableCell>
                    <TableCell>
                      {tx.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {tx.status === 'pending' && (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                      {tx.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-slate-400">Top traders in the YOLOSEUM community</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Rank</TableHead>
                  <TableHead className="text-slate-300">Trader</TableHead>
                  <TableHead className="text-slate-300">Win Rate</TableHead>
                  <TableHead className="text-slate-300">Total Trades</TableHead>
                  <TableHead className="text-slate-300">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTraders.map((trader) => (
                  <TableRow key={trader.id} className="border-slate-700">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {trader.rank === 1 && <Trophy className="h-5 w-5 text-amber-500" />}
                        {trader.rank === 2 && <Trophy className="h-5 w-5 text-slate-400" />}
                        {trader.rank === 3 && <Trophy className="h-5 w-5 text-orange-600" />}
                        <span className="font-bold text-white">#{trader.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trader.avatar} />
                          <AvatarFallback className="bg-amber-600 text-white">
                            {trader.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">{trader.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={trader.winRate} className="w-20 h-2" />
                        <span className="text-slate-300 text-sm">{trader.winRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{trader.totalTrades}</TableCell>
                    <TableCell className="font-semibold text-green-500">
                      {trader.profit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTraders = () => (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Top Traders</h1>
          <p className="text-slate-400">Follow and learn from the best traders</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTraders.map((trader) => (
            <Card key={trader.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={trader.avatar} />
                    <AvatarFallback className="bg-amber-600 text-white text-xl">
                      {trader.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-white">{trader.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-slate-400">Rank #{trader.rank}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Win Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={trader.winRate} className="w-20 h-2" />
                      <span className="text-sm font-medium text-white">
                        {trader.winRate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Trades</span>
                    <span className="text-sm font-medium text-white">
                      {trader.totalTrades}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Profit</span>
                    <span className="text-sm font-semibold text-green-500">
                      {trader.profit}
                    </span>
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 mt-4">
                    Follow Trader
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-amber-600 text-white text-3xl">
                    YK
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <CardTitle className="text-2xl text-white mb-2">YoloKing</CardTitle>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-amber-600">Rank #12</Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      156 Trades
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      78.5% Win Rate
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Profit</span>
                  <span className="font-semibold text-green-500">$45,231</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Win Rate</span>
                  <span className="font-semibold text-white">78.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Trades</span>
                  <span className="font-semibold text-white">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Best Trade</span>
                  <span className="font-semibold text-green-500">+$8,234</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Member Since</span>
                  <span className="font-medium text-white">Jan 2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Wallet</span>
                  <span className="font-medium text-white">7x2...9kL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Level</span>
                  <Badge className="bg-amber-600">Pro Trader</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 rounded-lg bg-slate-700/50">
                  <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                  <span className="text-xs text-slate-300 text-center">Top 20 Trader</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-slate-700/50">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-xs text-slate-300 text-center">10 Win Streak</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-slate-700/50">
                  <Zap className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-xs text-slate-300 text-center">Fast Trader</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-slate-700/50">
                  <Target className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-xs text-slate-300 text-center">Sniper</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {renderHeader()}
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'dashboard' && renderDashboard()}
      {currentPage === 'leaderboard' && renderLeaderboard()}
      {currentPage === 'traders' && renderTraders()}
      {currentPage === 'profile' && renderProfile()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
