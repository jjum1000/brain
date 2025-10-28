import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Trophy,
  Users,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Zap,
  Target,
  Loader2,
  Settings,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { SignupDialog } from '@/components/auth/SignupDialog';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { Separator } from '@/components/ui/separator';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 * Provides consistent header, footer, and page structure for all pages
 * Handles navigation and authentication dialogs
 */
export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: Briefcase, protected: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Traders', path: '/traders', icon: Users },
    { name: 'Strategies', path: '/strategies', icon: Target },
    { name: 'Profile', path: '/profile', icon: User, protected: true },
    { name: 'Settings', path: '/settings', icon: Settings, protected: true },
  ];

  const handleNavClick = (path: string, isProtected?: boolean) => {
    if (isProtected && !user) {
      setLoginDialogOpen(true);
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Zap className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold text-amber-500">YOLOSEUM</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation
              .filter((item) => !item.protected || user)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-500 ${
                      isActive(item.path) ? 'text-amber-500' : 'text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
          </nav>

          {/* Desktop Auth & Menu */}
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
                onClick={() => setLoginDialogOpen(true)}
                className="hidden md:flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-amber-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col gap-4">
              {navigation
                .filter((item) => !item.protected || user)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path, item.protected)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-500 ${
                        isActive(item.path) ? 'text-amber-500' : 'text-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </button>
                  );
                })}

              {!user && !loading && (
                <>
                  <Separator className="bg-slate-700" />
                  <Button
                    onClick={() => setLoginDialogOpen(true)}
                    className="w-full bg-amber-600 hover:bg-amber-700 justify-center items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setSignupDialogOpen(true)}
                    variant="outline"
                    className="w-full border-slate-700 hover:bg-slate-800 justify-center items-center gap-2"
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {user && !loading && (
                <>
                  <Separator className="bg-slate-700" />
                  <span className="text-sm text-slate-300 px-2">
                    {user.displayName || user.email}
                  </span>
                  <Button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-slate-700 hover:bg-slate-800 justify-center items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="border-t border-slate-800 bg-slate-900/50 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-amber-500">YOLOSEUM</span>
            </div>
            <p className="text-sm text-slate-400">Decentralized meme coin trading platform</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Trading
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Strategies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Social</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-400">
            © 2025 YOLOSEUM. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm text-slate-400">
            <a href="#" className="hover:text-amber-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {renderHeader()}

      <main className="flex-1">{children}</main>

      {renderFooter()}

      {/* Auth Dialogs */}
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSignUpClick={() => {
          setLoginDialogOpen(false);
          setSignupDialogOpen(true);
        }}
        onForgotPasswordClick={() => {
          setLoginDialogOpen(false);
          setForgotPasswordDialogOpen(true);
        }}
      />
      <SignupDialog
        open={signupDialogOpen}
        onOpenChange={setSignupDialogOpen}
        onSignInClick={() => {
          setSignupDialogOpen(false);
          setLoginDialogOpen(true);
        }}
      />
      <ForgotPasswordDialog
        open={forgotPasswordDialogOpen}
        onOpenChange={setForgotPasswordDialogOpen}
        onBackToLogin={() => {
          setForgotPasswordDialogOpen(false);
          setLoginDialogOpen(true);
        }}
      />
    </div>
  );
}
