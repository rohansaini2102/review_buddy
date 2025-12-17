'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Smartphone, QrCode, Copy, Building2, Monitor } from 'lucide-react';

const features = [
  {
    title: 'Pre-Written Templates',
    description: 'Five professionally written review templates your customers can personalize and post in seconds.',
    icon: FileText,
  },
  {
    title: 'Mobile Optimized',
    description: 'Beautiful review pages that work perfectly on any device. Most reviews happen on mobile.',
    icon: Smartphone,
  },
  {
    title: 'QR Codes',
    description: 'Generate printable QR codes for your store, receipts, or business cards. Scan to review.',
    icon: QrCode,
  },
  {
    title: 'One-Click Copy',
    description: 'Customers tap to copy any template, then paste directly into Google. Zero friction.',
    icon: Copy,
  },
  {
    title: 'Works With Any Business',
    description: 'If you have a Google Business Profile, Review Buddy works for you. Any industry, any size.',
    icon: Building2,
  },
  {
    title: 'No App Required',
    description: 'Your customers don\'t need to download anything. Just click the link and review.',
    icon: Monitor,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Get More Reviews
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple tools that remove friction and make it easy for your happy customers to share their experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                <CardContent className="p-0">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
