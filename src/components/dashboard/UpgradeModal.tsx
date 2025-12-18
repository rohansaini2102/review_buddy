'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Building2, Check } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLimit: number;
  currentCount: number;
}

export function UpgradeModal({ open, onOpenChange, currentLimit, currentCount }: UpgradeModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Business Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;re using {currentCount} of {currentLimit} business profile{currentLimit !== 1 ? 's' : ''}.
            Upgrade to add more businesses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Plan Info */}
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              {currentLimit === 1 ? (
                <>Your <strong>Pro</strong> plan includes 1 business profile.</>
              ) : (
                <>Your <strong>Business</strong> plan includes {currentLimit} business profiles.</>
              )}
            </p>
          </div>

          {/* Upgrade Benefits */}
          {currentLimit === 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Upgrade to Business for:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-600" />
                  Up to 5 business profiles
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-600" />
                  Unlimited testimonials
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-600" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-600" />
                  Remove branding
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => router.push('/pricing')} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              View Upgrade Options
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
