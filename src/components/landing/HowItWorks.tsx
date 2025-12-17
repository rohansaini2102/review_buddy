'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Share2, Star } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Generate Your Link',
    description: 'Paste your Google Business review link or search for your business. We create a beautiful, mobile-optimized review page.',
    icon: Link2,
  },
  {
    number: '2',
    title: 'Share With Customers',
    description: 'Send your custom link via email, SMS, or print QR codes for your store. One tap opens your review page.',
    icon: Share2,
  },
  {
    number: '3',
    title: 'Collect Reviews',
    description: 'Customers pick a pre-written template, personalize it, and post to Google in under 30 seconds. No friction.',
    icon: Star,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get your first review in under 2 minutes. No complex setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200 transform -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s`, opacity: 0 }}
                >
                  {/* Card */}
                  <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardContent className="p-0">
                      {/* Step Number */}
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-6 mx-auto">
                        {step.number}
                      </div>

                      {/* Icon */}
                      <div className="flex justify-center mb-4 text-primary">
                        <Icon className="w-8 h-8" />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-foreground text-center mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-center">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/signup">Try It Now — It's Free</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Set up in 30 seconds
          </p>
        </div>
      </div>
    </section>
  );
}
