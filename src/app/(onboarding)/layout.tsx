'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, userProfile, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
    }

    // Redirect to dashboard if onboarding already completed
    if (!profileLoading && userProfile?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [user, loading, userProfile, profileLoading, router]);

  // Show loading while checking auth
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if onboarding completed (will redirect)
  if (userProfile?.onboardingCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Star className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Review Buddy</span>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            14-Day Free Trial
          </Badge>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {children}
      </main>
    </div>
  );
}
