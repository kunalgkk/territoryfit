import React, { useState, useEffect } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import { OverlayProvider } from './contexts/OverlayContext';
import { FeatureFlagsProvider, useFeatureFlags } from './contexts/FeatureFlagsContext';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { LoginButton } from './components/auth/LoginButton';
import { LoginStreakBadge } from './components/gamification/LoginStreakBadge';
import { AdBanner } from './components/subscription/AdBanner';
import { XPGainOverlay } from './components/overlays/XPGainOverlay';
import { LevelUpOverlay } from './components/overlays/LevelUpOverlay';
import { ZoneCaptureOverlay } from './components/overlays/ZoneCaptureOverlay';
import { Toaster } from '@/components/ui/sonner';
import {
  Home as HomeIcon,
  Map,
  Activity,
  User,
  BarChart2,
  Brain,
  Trophy,
  ShoppingBag,
  Shield,
  Users,
  Award,
  Package,
  CreditCard,
  Menu,
  X,
} from 'lucide-react';

// Pages
import { HomePage } from './pages/Home';
import { TerritoryMapPage } from './pages/TerritoryMap';
import { ActivityHistoryPage } from './pages/ActivityHistory';
import { AnalyticsPage } from './pages/Analytics';
import { AICoachPage } from './pages/AICoach';
import { LeaderboardPage } from './pages/Leaderboard';
import { BadgesPage } from './pages/Badges';
import { FriendsPage } from './pages/Friends';
import { TeamsPage } from './pages/Teams';
import { SubscriptionPage } from './pages/Subscription';
import { StorePage } from './pages/Store';
import { InventoryPage } from './pages/Inventory';
import { AdminPage } from './pages/Admin';
import { ProfilePage } from './pages/Profile';
import { PaymentSuccessPage } from './pages/PaymentSuccess';
import { PaymentFailurePage } from './pages/PaymentFailure';
import { SplashScreen } from './pages/SplashScreen';

// ─── Layout ───────────────────────────────────────────────────────────────────

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Determine subscription tier from localStorage (simple approach)
  const tier = (localStorage.getItem('subscriptionTier') as 'free' | 'premium' | 'pro' | 'elite') || 'free';
  const showAds = tier === 'free' && isAuthenticated;

  if (isInitializing) {
    return <SplashScreen />;
  }

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/territory-map', label: 'Map', icon: Map },
    { path: '/activity', label: 'Activity', icon: Activity },
    { path: '/analytics', label: 'Stats', icon: BarChart2 },
    { path: '/leaderboard', label: 'Ranks', icon: Trophy },
  ];

  const moreItems = [
    { path: '/ai-coach', label: 'AI Coach', icon: Brain },
    { path: '/badges', label: 'Badges', icon: Award },
    { path: '/friends', label: 'Friends', icon: Users },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/store', label: 'Store', icon: ShoppingBag },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/subscription', label: 'Subscription', icon: CreditCard },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2"
          >
            <img
              src="/assets/generated/app-icon.dim_256x256.png"
              alt="TerritoryFit"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="font-bold text-foreground text-sm tracking-tight hidden sm:block">TerritoryFit</span>
          </button>

          <div className="flex items-center gap-2">
            <LoginStreakBadge />
            <LoginButton />
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l border-border flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-foreground">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {[...navItems, ...moreItems].map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => { navigate({ to: path }); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    currentPath === path
                      ? 'bg-primary/10 text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card/50 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="flex-1 py-4 space-y-0.5 px-2">
            <div className="px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">Main</div>
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate({ to: path })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentPath === path
                    ? 'bg-primary/10 text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}

            <div className="px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1 mt-4">More</div>
            {moreItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate({ to: path })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentPath === path
                    ? 'bg-primary/10 text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Built with{' '}
              <span className="text-red-400">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'territoryfit')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-4">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentPath === path
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-mono">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Ad Banner for Free tier */}
      {showAds && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 md:left-56">
          <AdBanner />
        </div>
      )}

      {/* Profile Setup Modal */}
      <ProfileSetupModal open={showProfileSetup} />

      {/* Gamification Overlays */}
      <XPGainOverlay />
      <LevelUpOverlay />
      <ZoneCaptureOverlay />

      {/* Toast Notifications */}
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <FeatureFlagsProvider>
      <OverlayProvider>
        <AppLayout />
      </OverlayProvider>
    </FeatureFlagsProvider>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const mapRoute = createRoute({ getParentRoute: () => rootRoute, path: '/territory-map', component: TerritoryMapPage });
const activityRoute = createRoute({ getParentRoute: () => rootRoute, path: '/activity', component: ActivityHistoryPage });
const analyticsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/analytics', component: AnalyticsPage });
const aiCoachRoute = createRoute({ getParentRoute: () => rootRoute, path: '/ai-coach', component: AICoachPage });
const leaderboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/leaderboard', component: LeaderboardPage });
const badgesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/badges', component: BadgesPage });
const friendsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/friends', component: FriendsPage });
const teamsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/teams', component: TeamsPage });
const subscriptionRoute = createRoute({ getParentRoute: () => rootRoute, path: '/subscription', component: SubscriptionPage });
const storeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/store', component: StorePage });
const inventoryRoute = createRoute({ getParentRoute: () => rootRoute, path: '/inventory', component: InventoryPage });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminPage });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage });
const paymentSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-success', component: PaymentSuccessPage });
const paymentFailureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-failure', component: PaymentFailurePage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  mapRoute,
  activityRoute,
  analyticsRoute,
  aiCoachRoute,
  leaderboardRoute,
  badgesRoute,
  friendsRoute,
  teamsRoute,
  subscriptionRoute,
  storeRoute,
  inventoryRoute,
  adminRoute,
  profileRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}



import { useEffect, useState } from "react";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div>
      <h1>Territory Fit</h1>
      <button onClick={toggleTheme}>Toggle Light/Dark</button>
    </div>
  );
}

export default App;
