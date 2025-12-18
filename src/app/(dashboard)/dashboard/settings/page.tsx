'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { getCustomerPortalUrl } from '@/lib/polar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  CreditCard,
  LogOut,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Crown,
  Sparkles,
  Mail,
  Calendar,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile, hasActiveSubscription, trialDaysRemaining } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const handleManageSubscription = () => {
    window.open(getCustomerPortalUrl(), '_blank');
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account and subscription.
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {user?.displayName || 'User'}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {userProfile?.createdAt
                  ? formatDate(userProfile.createdAt.toDate())
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {userProfile?.subscription?.plan === 'business' ? (
                  <Crown className="w-5 h-5 text-amber-500" />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">
                    {userProfile?.subscription?.plan || 'Free'} Plan
                  </p>
                  {userProfile?.subscription?.status === 'trialing' && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                      Trial: {trialDaysRemaining}d left
                    </Badge>
                  )}
                  {userProfile?.subscription?.status === 'active' && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      Active
                    </Badge>
                  )}
                  {userProfile?.subscription?.status === 'expired' && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.subscription?.businessLimit || 1} business profile{(userProfile?.subscription?.businessLimit || 1) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {hasActiveSubscription && (
              <Button variant="outline" onClick={handleManageSubscription}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage
              </Button>
            )}
          </div>

          {/* Upgrade/Subscribe CTA */}
          {!hasActiveSubscription && (
            <Button className="w-full" asChild>
              <Link href="/pricing">
                <Sparkles className="w-4 h-4 mr-2" />
                Subscribe Now
              </Link>
            </Button>
          )}

          {userProfile?.subscription?.status === 'trialing' && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/pricing">
                View Plans & Subscribe
              </Link>
            </Button>
          )}

          {userProfile?.subscription?.plan === 'pro' && userProfile?.subscription?.status === 'active' && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Business
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </Button>

          {/* Delete Account */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account, all your businesses, and cancel any active subscriptions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    // TODO: Implement account deletion
                    alert('Account deletion is not yet implemented. Please contact support.');
                  }}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@reviewbuddy.app"
              className="text-primary hover:underline"
            >
              support@reviewbuddy.app
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
