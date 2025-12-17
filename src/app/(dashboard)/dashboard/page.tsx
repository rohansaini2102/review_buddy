'use client';

import { useState } from 'react';
import { LinkGenerator } from '@/components/home/LinkGenerator';
import { LivePreview } from '@/components/home/LivePreview';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessInfo, PlacesApiResponse } from '@/types';
import { parseGoogleReviewUrl, generateReviewPageUrl, generateGoogleReviewUrl } from '@/lib/url-parser';

export default function DashboardPage() {
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Generate Review Link
        </h1>
        <p className="text-muted-foreground">
          Create a shareable link that makes it easy for your customers to leave Google reviews.
        </p>
      </div>

      {/* Link Generator */}
      <Card className="mb-8 shadow-lg">
        <CardContent className="pt-6">
          <LinkGenerator
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
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
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Paste your link
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your Google Business review link or Place ID
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Preview & customize
                </h3>
                <p className="text-sm text-muted-foreground">
                  See exactly what your customers will see
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Share the link
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send the shareable link or QR code to your customers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
