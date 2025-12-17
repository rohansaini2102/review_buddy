'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AuthCard,
  GoogleButton,
  AuthDivider,
  EmailPasswordForm,
} from '@/components/auth';
import {
  signInWithGoogle,
  signUpWithEmail,
  getAuthErrorMessage,
} from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleEmailSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    const { user, error } = await signUpWithEmail(email, password);

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
    <AuthCard
      title="Create your account"
      subtitle="Start getting more reviews today"
    >
      {/* Google Sign In */}
      <GoogleButton
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
        label="Sign up with Google"
      />

      <AuthDivider text="or sign up with email" />

      {/* Email/Password Form */}
      <EmailPasswordForm
        mode="signup"
        onSubmit={handleEmailSignUp}
        isLoading={isLoading}
        error={error}
      />

      {/* Terms */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>

      {/* Sign In Link */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
