'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Eye, Inbox, Clock } from 'lucide-react';

const stats = [
  {
    number: '93%',
    label: 'of customers read reviews before buying',
    description: 'Reviews are the first thing customers check',
    icon: Eye,
  },
  {
    number: '5%',
    label: 'of customers actually leave reviews',
    description: 'Most happy customers stay silent',
    icon: Inbox,
  },
  {
    number: '50%',
    label: "say leaving reviews takes too long",
    description: "Friction kills your review count",
    icon: Clock,
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Problem Isn't Your Service
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            It's the <span className="text-primary font-semibold">friction</span>.
            Most customers love your business but never leave a review.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.number}
                className="p-8 text-center group hover:scale-105 transition-transform duration-300 animate-fade-in-up shadow-lg hover:shadow-xl"
                style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
              >
                <CardContent className="p-0">
                  {/* Icon */}
                  <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Number */}
                  <div className="text-5xl sm:text-6xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>

                  {/* Label */}
                  <p className="text-lg font-medium text-foreground mb-2">
                    {stat.label}
                  </p>

                  {/* Description */}
                  <p className="text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Message */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">
            You're leaving money on the table.{' '}
            <span className="font-semibold text-foreground">
              Businesses with more reviews earn up to 82% more revenue.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
