'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedBusinesses, SavedBusiness } from '@/lib/firestore';
import { LivePreview } from '@/components/home/LivePreview';
import { QRCodeSection } from '@/components/home/QRCodeSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateReviewPageUrl, generateGoogleReviewUrl } from '@/lib/url-parser';
import {
  Building2,
  Star,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Link2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [businesses, setBusinesses] = useState<SavedBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved businesses
  useEffect(() => {
    async function loadBusinesses() {
      if (!user) return;
      try {
        const savedBusinesses = await getSavedBusinesses(user.uid);
        setBusinesses(savedBusinesses);
        if (savedBusinesses.length > 0) {
          setSelectedBusiness(savedBusinesses[0]);
        }
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, [user]);

  // Generate URLs for selected business
  const shareableUrl = selectedBusiness
    ? generateReviewPageUrl(
        selectedBusiness.placeId,
        process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      )
    : '';

  const googleReviewUrl = selectedBusiness
    ? generateGoogleReviewUrl(selectedBusiness.placeId)
    : '';

  // Copy link to clipboard
  const handleCopy = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Business Added</h2>
            <p className="text-muted-foreground mb-6">
              You haven't added a business yet. Complete the onboarding to get started.
            </p>
            <Button onClick={() => window.location.href = '/onboarding'}>
              Add Your Business
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Your Review Link
        </h1>
        <p className="text-muted-foreground">
          Share this link with customers to collect Google reviews easily.
        </p>
      </div>

      {/* Business Card */}
      {selectedBusiness && (
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Business photo */}
            {selectedBusiness.photoUrl && (
              <div className="md:w-48 h-48 md:h-auto bg-muted flex-shrink-0">
                <img
                  src={selectedBusiness.photoUrl}
                  alt={selectedBusiness.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Business info */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedBusiness.name}</h2>
                  {selectedBusiness.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedBusiness.address}
                    </p>
                  )}
                  {selectedBusiness.rating && (
                    <p className="text-sm flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{selectedBusiness.rating}</span>
                      {selectedBusiness.reviewCount && (
                        <span className="text-muted-foreground">
                          ({selectedBusiness.reviewCount} reviews)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(googleReviewUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Google Reviews
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Review Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Your Review Link
          </CardTitle>
          <CardDescription>
            Share this link with customers. They'll see a beautiful review page that leads to Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm font-mono truncate">
              {shareableUrl}
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQR ? 'Hide' : 'Show'} QR Code
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(shareableUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {showQR && selectedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Print this QR code and display it at your business location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QRCodeSection
              shareableUrl={shareableUrl}
              businessName={selectedBusiness.name}
            />
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {selectedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              This is what your customers will see when they click the link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-background">
              <LivePreview
                businessInfo={{
                  placeId: selectedBusiness.placeId,
                  name: selectedBusiness.name,
                  address: selectedBusiness.address || '',
                  photoUrl: selectedBusiness.photoUrl || null,
                  rating: selectedBusiness.rating || null,
                  totalRatings: selectedBusiness.reviewCount || null,
                }}
                shareableUrl={shareableUrl}
                googleReviewUrl={googleReviewUrl}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Getting More Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">1.</span>
              Send the link via SMS or email right after a positive interaction
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">2.</span>
              Print QR codes on receipts, business cards, or table tents
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">3.</span>
              Add the link to your email signature
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">4.</span>
              Ask for reviews when customers express satisfaction
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
