'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Star className="w-6 h-6 text-primary-foreground" fill="currentColor" />
        </div>
        <span className="text-2xl font-bold text-foreground">
          Review Buddy
        </span>
      </Link>

      {/* Card */}
      <Card className="shadow-xl shadow-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && (
            <CardDescription>{subtitle}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
