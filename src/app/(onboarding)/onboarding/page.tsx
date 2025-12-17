'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlacesAutocomplete } from '@/components/ui/PlacesAutocomplete';
import { saveBusiness, updateOnboardingStatus } from '@/lib/firestore';
import { parseGoogleReviewUrl } from '@/lib/url-parser';
import {
  Sparkles,
  ArrowRight,
  Building2,
  Link2,
  CheckCircle2,
  Loader2,
  Star,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BusinessInfo } from '@/types';

type Step = 'welcome' | 'business' | 'complete';

export default function OnboardingPage() {
  const { user, trialDaysRemaining, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('welcome');
  const [inputMethod, setInputMethod] = useState<'search' | 'link'>('search');
  const [linkInput, setLinkInput] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle business selection from autocomplete
  const handleBusinessSelect = async (placeId: string, name: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/places/${encodeURIComponent(placeId)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedBusiness(data.data);
      } else {
        setError('Could not fetch business details. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle link submission
  const handleLinkSubmit = async () => {
    if (!linkInput.trim()) {
      setError('Please enter a Google Maps or review link');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Parse the URL to extract place ID
      const parsed = parseGoogleReviewUrl(linkInput);

      if (!parsed.placeId && parsed.type === 'unknown') {
        setError('Invalid URL. Please enter a valid Google Maps or review link.');
        setIsLoading(false);
        return;
      }

      // Fetch business details
      const queryId = parsed.type === 'g.page' ? linkInput : (parsed.placeId || linkInput);
      const response = await fetch(`/api/places/${encodeURIComponent(queryId)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedBusiness(data.data);
      } else {
        setError(data.error || 'Could not fetch business details. Please check the URL.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save business and complete onboarding
  const handleCompleteOnboarding = async () => {
    if (!user || !selectedBusiness) return;

    setIsLoading(true);
    setError('');

    try {
      // Save business to Firestore
      await saveBusiness(user.uid, {
        placeId: selectedBusiness.placeId,
        name: selectedBusiness.name,
        address: selectedBusiness.address,
        photoUrl: selectedBusiness.photoUrl || undefined,
        rating: selectedBusiness.rating || undefined,
        reviewCount: selectedBusiness.totalRatings || undefined,
      });

      // Update onboarding status
      await updateOnboardingStatus(user.uid, true);

      // Refresh profile to get updated data
      await refreshProfile();

      // Move to complete step
      setStep('complete');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to save business. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Go to dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {['welcome', 'business', 'complete'].map((s, index) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : ['welcome', 'business', 'complete'].indexOf(step) > index
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {['welcome', 'business', 'complete'].indexOf(step) > index ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <div
                className={cn(
                  'w-12 h-0.5',
                  ['welcome', 'business', 'complete'].indexOf(step) > index
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 'welcome' && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Review Buddy!</CardTitle>
            <CardDescription className="text-base">
              You have <span className="font-semibold text-primary">{trialDaysRemaining} days</span> of free Pro trial.
              No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">What you'll get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  1 business profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Unlimited review links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  QR code generator
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Custom review page
                </li>
              </ul>
            </div>

            <Button onClick={() => setStep('business')} className="w-full h-12" size="lg">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'business' && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Add Your Business</CardTitle>
            <CardDescription className="text-base">
              Search by name or paste your Google Maps link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Input method tabs */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => {
                  setInputMethod('search');
                  setError('');
                  setSelectedBusiness(null);
                }}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                  inputMethod === 'search'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Search by Name
              </button>
              <button
                onClick={() => {
                  setInputMethod('link');
                  setError('');
                  setSelectedBusiness(null);
                }}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                  inputMethod === 'link'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Link2 className="w-4 h-4 inline mr-2" />
                Paste Link
              </button>
            </div>

            {/* Search input */}
            {inputMethod === 'search' && !selectedBusiness && (
              <div className="space-y-2">
                <Label>Search for your business</Label>
                <PlacesAutocomplete
                  onSelect={handleBusinessSelect}
                  placeholder="e.g., Joe's Coffee Shop, New York"
                />
              </div>
            )}

            {/* Link input */}
            {inputMethod === 'link' && !selectedBusiness && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Google Maps or Review Link</Label>
                  <Input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://maps.google.com/... or https://g.page/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste any Google Maps link, Google review link, or g.page URL
                  </p>
                </div>
                <Button
                  onClick={handleLinkSubmit}
                  disabled={isLoading || !linkInput.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Find Business
                </Button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && inputMethod === 'search' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Selected business preview */}
            {selectedBusiness && (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  {selectedBusiness.photoUrl && (
                    <div className="h-40 bg-muted">
                      <img
                        src={selectedBusiness.photoUrl}
                        alt={selectedBusiness.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{selectedBusiness.name}</h3>
                    {selectedBusiness.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedBusiness.address}
                      </p>
                    )}
                    {selectedBusiness.rating && (
                      <p className="text-sm flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {selectedBusiness.rating}
                        {selectedBusiness.totalRatings && (
                          <span className="text-muted-foreground">
                            ({selectedBusiness.totalRatings} reviews)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedBusiness(null);
                      setLinkInput('');
                    }}
                    className="flex-1"
                  >
                    Change
                  </Button>
                  <Button
                    onClick={handleCompleteOnboarding}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription className="text-base">
              Your 14-day Pro trial has started. Start collecting reviews!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {selectedBusiness && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Your business:</p>
                <p className="font-semibold">{selectedBusiness.name}</p>
                {selectedBusiness.address && (
                  <p className="text-sm text-muted-foreground">{selectedBusiness.address}</p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-center">What's next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">1.</span>
                  Generate your review link in the dashboard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">2.</span>
                  Share it with customers via email, SMS, or print QR codes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">3.</span>
                  Watch your Google reviews grow!
                </li>
              </ul>
            </div>

            <Button onClick={handleGoToDashboard} className="w-full h-12" size="lg">
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
