'use client';

import { useAuth } from '@/contexts/AuthContext';
import { POLAR_CONFIG, getCheckoutUrl, getCustomerPortalUrl } from '@/lib/polar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Building2, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const { user, userProfile, trialDaysRemaining, hasActiveSubscription } = useAuth();

  const currentPlan = userProfile?.subscription?.plan;
  const currentStatus = userProfile?.subscription?.status;

  const handleSubscribe = (plan: 'pro' | 'business') => {
    window.location.href = getCheckoutUrl(plan, user?.email || undefined);
  };

  const handleManageSubscription = () => {
    window.open(getCustomerPortalUrl(), '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get more reviews and grow your business with Review Buddy.
          {currentStatus === 'trialing' && (
            <span className="block mt-2 text-primary font-medium">
              You have {trialDaysRemaining} days left in your free trial.
            </span>
          )}
        </p>
      </div>

      {/* Current Plan Banner */}
      {hasActiveSubscription && currentPlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {currentPlan === 'business' ? (
                    <Crown className="w-5 h-5 text-primary" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    Current Plan: <span className="text-primary capitalize">{currentPlan}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentStatus === 'trialing'
                      ? `Trial ends in ${trialDaysRemaining} days`
                      : 'Active subscription'
                    }
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pro Plan */}
        <Card className={cn(
          'relative overflow-hidden',
          currentPlan === 'pro' && 'border-primary ring-2 ring-primary/20'
        )}>
          {currentPlan === 'pro' && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary">Current Plan</Badge>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>Pro</CardTitle>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${POLAR_CONFIG.products.pro.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <CardDescription>
              Perfect for small businesses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {POLAR_CONFIG.products.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {currentPlan === 'pro' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : currentStatus === 'trialing' ? (
              <Button className="w-full" onClick={() => handleSubscribe('pro')}>
                Subscribe Now
              </Button>
            ) : (
              <Button className="w-full" onClick={() => handleSubscribe('pro')}>
                <Zap className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Business Plan */}
        <Card className={cn(
          'relative overflow-hidden',
          currentPlan === 'business' && 'border-primary ring-2 ring-primary/20'
        )}>
          {currentPlan === 'business' && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary">Current Plan</Badge>
            </div>
          )}
          <div className="absolute top-4 right-4">
            {currentPlan !== 'business' && (
              <Badge variant="secondary">Popular</Badge>
            )}
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <CardTitle>Business</CardTitle>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${POLAR_CONFIG.products.business.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <CardDescription>
              For growing businesses with multiple locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {POLAR_CONFIG.products.business.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {currentPlan === 'business' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => handleSubscribe('business')}>
                <Building2 className="w-4 h-4 mr-2" />
                {currentPlan === 'pro' ? 'Upgrade to Business' : 'Get Business'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ or Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What happens after my trial ends?</h4>
            <p className="text-sm text-muted-foreground">
              After your 14-day trial, you'll need to subscribe to continue using Review Buddy. Your data will be saved.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I upgrade or downgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Changes take effect immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
