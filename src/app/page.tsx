'use client';

import { useState } from 'react';
import { LinkGenerator } from '@/components/home/LinkGenerator';
import { LivePreview } from '@/components/home/LivePreview';
import { Card } from '@/components/ui/Card';
import { BusinessInfo, PlacesApiResponse } from '@/types';
import { parseGoogleReviewUrl, generateReviewPageUrl, generateGoogleReviewUrl } from '@/lib/url-parser';

export default function HomePage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async (inputUrl: string) => {
    setIsLoading(true);
    setError('');
    setBusinessInfo(null);

    try {
      // Parse the input URL to get Place ID
      const parsed = parseGoogleReviewUrl(inputUrl);

      if (!parsed.placeId && parsed.type === 'unknown') {
        setError('Invalid URL. Please enter a valid Google review link or Place ID.');
        setIsLoading(false);
        return;
      }

      // For g.page URLs, we need to send the full URL to the API
      const queryId = parsed.type === 'g.page' ? inputUrl : (parsed.placeId || inputUrl);

      // Fetch business details from our API
      const response = await fetch(`/api/places/${encodeURIComponent(queryId)}`);
      const data: PlacesApiResponse = await response.json();

      if (!data.success || !data.data) {
        setError(data.error || 'Failed to fetch business details');
        setIsLoading(false);
        return;
      }

      // Set business info
      setBusinessInfo(data.data);

      // Generate shareable URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const shareable = generateReviewPageUrl(data.data.placeId, baseUrl);
      setShareableUrl(shareable);

      // Generate Google review URL
      const googleUrl = generateGoogleReviewUrl(data.data.placeId);
      setGoogleReviewUrl(googleUrl);

    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Review Buddy
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Help your customers leave Google reviews easily with pre-written templates
          </p>
        </header>

        {/* Link Generator */}
        <Card variant="elevated" className="mb-8">
          <LinkGenerator
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
          />
        </Card>

        {/* Live Preview */}
        {businessInfo && shareableUrl && (
          <LivePreview
            businessInfo={businessInfo}
            shareableUrl={shareableUrl}
            googleReviewUrl={googleReviewUrl}
          />
        )}

        {/* Instructions */}
        {!businessInfo && (
          <div className="mt-12 text-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <Card>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Paste your link
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Enter your Google Business review link or Place ID
                </p>
              </Card>
              <Card>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                </div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Preview & customize
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  See exactly what your customers will see
                </p>
              </Card>
              <Card>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                </div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Share the link
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Send the shareable link to your customers
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
