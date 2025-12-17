'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AuthCard,
  GoogleButton,
  AuthDivider,
  EmailPasswordForm,
  MagicLinkForm,
} from '@/components/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  sendMagicLink,
  getAuthErrorMessage,
} from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    const { user, error } = await signInWithGoogle();

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push('/dashboard');
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    const { user, error } = await signInWithEmail(email, password);

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push('/dashboard');
    }
  };

  const handleMagicLink = async (email: string) => {
    setIsLoading(true);
    setError('');

    const { success, error } = await sendMagicLink(email);

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsLoading(false);
      return;
    }

    if (success) {
      setMagicLinkSent(true);
    }
    setIsLoading(false);
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      {!showMagicLink ? (
        <>
          {/* Google Sign In */}
          <GoogleButton onClick={handleGoogleSignIn} isLoading={isLoading} />

          <AuthDivider />

          {/* Email/Password Form */}
          <EmailPasswordForm
            mode="login"
            onSubmit={handleEmailSignIn}
            isLoading={isLoading}
            error={error}
          />

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Magic Link Option */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setShowMagicLink(true)}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Sign in with email link instead
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Magic Link Form */}
          <MagicLinkForm
            onSubmit={handleMagicLink}
            isLoading={isLoading}
            error={error}
            success={magicLinkSent}
          />

          {!magicLinkSent && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowMagicLink(false)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to password sign in
              </button>
            </div>
          )}
        </>
      )}

      {/* Sign Up Link */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}
