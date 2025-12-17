'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti animation after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      {/* Simple confetti effect using CSS */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][
                  Math.floor(Math.random() * 5)
                ],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <Card className="max-w-md w-full shadow-2xl border-0">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce-once">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for subscribing to Review Buddy. Your account has been upgraded.
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <h3 className="font-medium text-sm text-foreground">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your subscription is now active</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>You can now add business profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Generate unlimited review links</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <Button asChild className="w-full h-12" size="lg">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Checkout ID for reference */}
          {checkoutId && (
            <p className="text-xs text-muted-foreground pt-4">
              Order ID: {checkoutId.slice(0, 8)}...
            </p>
          )}
        </CardContent>
      </Card>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes bounce-once {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0">
        <CardContent className="pt-12 pb-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
