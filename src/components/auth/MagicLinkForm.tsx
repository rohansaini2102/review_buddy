'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MagicLinkFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

export default function MagicLinkForm({
  onSubmit,
  isLoading = false,
  error,
  success = false,
}: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    await onSubmit(email);
  };

  const displayError = error || localError;

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Check your email
        </h3>
        <p className="text-muted-foreground">
          We sent a sign-in link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Click the link in the email to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center mb-4">
        We'll send you a magic link to sign in instantly - no password needed.
      </p>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
          className="h-12"
        />
      </div>

      {/* Error */}
      {displayError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="secondary"
        disabled={isLoading}
        className="w-full h-12"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending link...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-5 w-5" />
            Email me a login link
          </>
        )}
      </Button>
    </form>
  );
}
