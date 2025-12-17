'use client';

import Link from 'next/link';
import { AuthCard } from '@/components/auth';

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verify your email" subtitle="">
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--primary)]"
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
        </div>

        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Check your inbox
        </h3>

        <p className="text-[var(--text-muted)] mb-6">
          We've sent you a verification email. Click the link in the email to verify your account.
        </p>

        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            Didn't receive the email?
          </p>
          <button className="text-[var(--primary)] font-medium hover:underline">
            Resend verification email
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <Link
            href="/login"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
