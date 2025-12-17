'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero pt-24 pb-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-violet-200 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Trusted by 500+ businesses
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Turn Happy Customers Into{' '}
              <span className="gradient-text">5-Star Reviews</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <strong className="text-foreground">93%</strong> of people read reviews before buying.{' '}
              <strong className="text-foreground">Only 5%</strong> actually leave them.{' '}
              <span className="text-primary">We fix that.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                4.9/5 from 200+ reviews
              </span>
            </div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl animate-float">
                {/* Phone Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-8 bg-muted flex items-center justify-center">
                    <div className="w-20 h-5 bg-gray-900 rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Business Card */}
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3">
                        <span className="text-2xl text-white font-bold">RB</span>
                      </div>
                      <h3 className="font-semibold text-foreground">Review Buddy Demo</h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">4.9</span>
                      </div>
                    </div>

                    {/* Review Templates */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center">Pick a template to get started:</p>

                      {['Quick 5-Star', 'Detailed Experience', 'Professional'].map((template, i) => (
                        <div
                          key={template}
                          className={`p-3 rounded-xl border ${i === 0 ? 'border-violet-300 bg-violet-50' : 'border-gray-200'} cursor-pointer hover:border-violet-300 transition-colors`}
                        >
                          <p className="text-sm font-medium text-foreground">{template}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {i === 0 && "Amazing experience! Highly recommend..."}
                            {i === 1 && "I had a wonderful experience with..."}
                            {i === 2 && "Professional service from start to..."}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full">Write Review on Google</Button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">New Review!</p>
                    <p className="text-xs text-muted-foreground">2 min ago</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">+127%</p>
                    <p className="text-xs text-muted-foreground">More reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
