'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-violet-200 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Start getting more reviews today
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Stop Losing Revenue to{' '}
          <span className="gradient-text">Missing Reviews</span>
        </h2>

        {/* Subheadline */}
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Every day without reviews is potential customers choosing your competitors.
          Get your free review link in 30 seconds.
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">76%</div>
            <div className="text-sm text-muted-foreground">leave reviews when asked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">370%</div>
            <div className="text-sm text-muted-foreground">more conversions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">30s</div>
            <div className="text-sm text-muted-foreground">to set up</div>
          </div>
        </div>

        {/* CTA Button */}
        <Button asChild size="lg" className="text-lg px-10 py-6">
          <Link href="/signup">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>

        {/* Trust text */}
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • Free forever for basic use • Set up in seconds
        </p>
      </div>
    </section>
  );
}
