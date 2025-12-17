'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth';
import {
  completeMagicLinkSignIn,
  getSavedEmailForSignIn,
  isMagicLink,
  getAuthErrorMessage,
} from '@/lib/auth';

export default function AuthActionPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [needsEmail, setNeedsEmail] = useState(false);

  useEffect(() => {
    const handleMagicLink = async () => {
      const url = window.location.href;

      // Check if this is a magic link
      if (!isMagicLink(url)) {
        setError('Invalid sign-in link');
        setIsLoading(false);
        return;
      }

      // Get saved email
      const savedEmail = getSavedEmailForSignIn();

      if (!savedEmail) {
        // Ask user for email
        setNeedsEmail(true);
        setIsLoading(false);
        return;
      }

      // Complete sign in
      const { user, error } = await completeMagicLinkSignIn(savedEmail, url);

      if (error) {
        setError(getAuthErrorMessage(error));
        setIsLoading(false);
        return;
      }

      if (user) {
        router.push('/dashboard');
      }
    };

    handleMagicLink();
  }, [router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const url = window.location.href;
    const { user, error } = await completeMagicLinkSignIn(email, url);

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push('/dashboard');
    }
  };

  return (
    <AuthCard title="Completing sign in..." subtitle="">
      {isLoading && !needsEmail && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="animate-spin h-16 w-16 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-[var(--text-muted)]">Signing you in...</p>
        </div>
      )}

      {needsEmail && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <p className="text-sm text-[var(--text-muted)] text-center mb-4">
            Please confirm your email address to complete sign in.
          </p>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Complete Sign In'}
          </button>
        </form>
      )}

      {error && !needsEmail && (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Sign in failed
          </h3>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <a
            href="/login"
            className="text-[var(--primary)] font-medium hover:underline"
          >
            Try again
          </a>
        </div>
      )}
    </AuthCard>
  );
}
