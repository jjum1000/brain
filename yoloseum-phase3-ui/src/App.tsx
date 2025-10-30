import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Target, Shield } from 'lucide-react';
import { CardGridSkeleton } from '@/components/common/Skeletons';

// Lazy-loaded page components for code splitting
const Dashboard = lazy(() => import('@/components/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Leaderboard = lazy(() => import('@/components/pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Traders = lazy(() => import('@/components/pages/Traders').then(m => ({ default: m.Traders })));
const TraderDetail = lazy(() => import('@/components/pages/TraderDetail').then(m => ({ default: m.TraderDetail })));
const Profile = lazy(() => import('@/components/pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('@/components/pages/Settings').then(m => ({ default: m.Settings })));
const Strategies = lazy(() => import('@/components/pages/Strategies').then(m => ({ default: m.Strategies })));
const StrategyDetail = lazy(() => import('@/components/pages/StrategyDetail').then(m => ({ default: m.StrategyDetail })));
const Portfolio = lazy(() => import('@/components/pages/Portfolio').then(m => ({ default: m.Portfolio })));
const NotFound = lazy(() => import('@/components/pages/NotFound').then(m => ({ default: m.NotFound })));

/**
 * Loading Fallback Component for Lazy Routes
 */
function RouteLoadingFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl px-4">
        <CardGridSkeleton count={4} />
      </div>
    </div>
  );
}

/**
 * Home Page Component
 * Landing page with features and CTA
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-200px)] bg-slate-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4 container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-4 bg-amber-600/20 text-amber-300 border-amber-600/30">
            Welcome to YOLOSEUM
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Trade Smarter,
            <span className="text-amber-500"> Earn Better</span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join the decentralized community of crypto traders. Follow top strategies, learn from the best, and grow
            your portfolio with our innovative trading platform.
          </p>

          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose YOLOSEUM?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Real-Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Monitor top traders and strategies in real-time. Get instant updates on performance metrics and ROI.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Target className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Smart Strategy Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Choose from verified trading strategies backed by real performance data. Follow expert traders
                  automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Shield className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Secure & Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Non-custodial vaults with transparent fees. Your funds remain under your control while earning.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-slate-400 mb-6">
            Join thousands of traders earning passive income with YOLOSEUM
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * App Content Component
 * Handles routing and page selection
 */
function AppContent() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/traders" element={<Traders />} />
            <Route path="/trader/:id" element={<TraderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/strategy/:id" element={<StrategyDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

/**
 * Main App Component
 * Wraps everything with AuthProvider for authentication context
 */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
