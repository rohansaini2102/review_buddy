'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { getCheckoutUrl } from '@/lib/polar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  Link2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  Clock,
  AlertTriangle,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Generate Link',
    href: '/dashboard',
    icon: Link2,
  },
  {
    title: 'Billing & Plans',
    href: '/pricing',
    icon: CreditCard,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    disabled: true,
    badge: 'Soon',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    disabled: true,
    badge: 'Soon',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    userProfile,
    loading,
    profileLoading,
    trialDaysRemaining,
    isTrialExpired,
    hasActiveSubscription,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!profileLoading && userProfile && !userProfile.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [userProfile, profileLoading, router]);

  // Show expired modal if trial expired and no active subscription
  useEffect(() => {
    if (!profileLoading && userProfile && isTrialExpired && !hasActiveSubscription) {
      setShowExpiredModal(true);
    }
  }, [userProfile, profileLoading, isTrialExpired, hasActiveSubscription]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpgrade = (plan: 'pro' | 'business') => {
    window.location.href = getCheckoutUrl(plan, user?.email || undefined);
  };

  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render until we confirm user is authenticated
  if (!user) {
    return null;
  }

  // Don't render if onboarding not completed (will redirect)
  if (userProfile && !userProfile.onboardingCompleted) {
    return null;
  }

  // Get subscription badge info
  const getSubscriptionBadge = () => {
    if (!userProfile) return null;
    const status = userProfile.subscription?.status;
    const plan = userProfile.subscription?.plan;

    if (status === 'active') {
      return {
        text: plan === 'business' ? 'Business' : 'Pro',
        variant: 'default' as const,
        className: 'bg-primary text-primary-foreground',
      };
    }
    if (status === 'trialing') {
      return {
        text: `Trial: ${trialDaysRemaining}d`,
        variant: 'secondary' as const,
        className: 'bg-green-500/10 text-green-600 border-green-500/20',
      };
    }
    return {
      text: 'Free',
      variant: 'outline' as const,
      className: '',
    };
  };

  const badge = getSubscriptionBadge();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Trial expired modal */}
      <Dialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center">Your Trial Has Ended</DialogTitle>
            <DialogDescription className="text-center">
              Subscribe to continue using Review Buddy and keep generating review links.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button onClick={() => router.push('/pricing')} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              View Plans & Subscribe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial banner */}
      {userProfile?.subscription?.status === 'trialing' && (
        <div
          className={cn(
            'sticky top-0 z-50 px-4 py-2 text-center text-sm font-medium',
            trialDaysRemaining <= 3
              ? 'bg-amber-500/10 text-amber-700 border-b border-amber-500/20'
              : 'bg-green-500/10 text-green-700 border-b border-green-500/20'
          )}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
            {trialDaysRemaining <= 3 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span>
              {trialDaysRemaining <= 3
                ? `Trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}!`
                : `Pro Trial: ${trialDaysRemaining} days remaining`}
            </span>
            <Button
              size="sm"
              variant={trialDaysRemaining <= 3 ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => router.push('/pricing')}
            >
              {trialDaysRemaining <= 3 ? 'Subscribe Now' : 'Upgrade'}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          userProfile?.subscription?.status === 'trialing' ? 'top-[41px]' : 'top-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Review Buddy
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/pricing' && pathname === '/pricing');
              return (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={(e) => {
                    if (item.disabled) e.preventDefault();
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* User section */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.displayName || 'User'}
                  </p>
                  {badge && (
                    <Badge variant={badge.variant} className={cn('text-xs', badge.className)}>
                      {badge.text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-card border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Star className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Review Buddy
            </span>
          </div>
          {badge && (
            <Badge variant={badge.variant} className={cn('ml-auto text-xs', badge.className)}>
              {badge.text}
            </Badge>
          )}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
