'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { POLAR_CONFIG, getCheckoutUrl, PlanType } from '@/lib/polar';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'pro' as PlanType,
    name: 'Pro',
    description: 'Perfect for small businesses',
    price: POLAR_CONFIG.products.pro.price,
    period: '/month',
    trial: '14-day free trial',
    popular: false,
    features: POLAR_CONFIG.products.pro.features,
    cta: 'Start Free Trial',
  },
  {
    id: 'business' as PlanType,
    name: 'Business',
    description: 'For agencies & multi-location businesses',
    price: POLAR_CONFIG.products.business.price,
    period: '/month',
    trial: null,
    popular: true,
    features: POLAR_CONFIG.products.business.features,
    cta: 'Get Started',
  },
];

export default function Pricing() {
  const [isLoading, setIsLoading] = useState<PlanType | null>(null);

  const handleSubscribe = (plan: PlanType) => {
    setIsLoading(plan);
    // Redirect to Polar checkout
    window.location.href = getCheckoutUrl(plan);
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose your plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start collecting more reviews today. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden transition-all duration-300 hover:shadow-xl',
                plan.popular && 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {/* Trial Badge */}
                {plan.trial && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {plan.trial}
                  </Badge>
                )}

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  className={cn(
                    'w-full h-12',
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-foreground hover:bg-foreground/90'
                  )}
                >
                  {isLoading === plan.id ? 'Redirecting...' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 30-day money-back guarantee.{' '}
            <Link href="#" className="text-primary hover:underline">
              View terms
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
