'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSavedBusinesses,
  getPageConfigWithDefaults,
  savePageConfig,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  SavedBusiness,
  PageConfig,
  DEFAULT_PAGE_CONFIG,
  Testimonial,
} from '@/lib/firestore';
import { PhonePreview } from '@/components/editor/PhonePreview';
import { TestimonialEditor } from '@/components/editor/TestimonialEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Save,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Palette,
  Type,
  MessageSquareQuote,
  MousePointer,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [businesses, setBusinesses] = useState<SavedBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [config, setConfig] = useState<PageConfig>({
    ...DEFAULT_PAGE_CONFIG,
    updatedAt: Timestamp.now(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get business limit for testimonials
  const maxTestimonials = userProfile?.subscription?.plan === 'business' ? 100 : 3;

  // Helper to deduplicate testimonials by ID
  const dedupeTestimonials = (testimonials: Testimonial[]): Testimonial[] => {
    const seen = new Set<string>();
    return testimonials.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  };

  // Load businesses
  useEffect(() => {
    async function loadBusinesses() {
      if (!user) return;
      try {
        const savedBusinesses = await getSavedBusinesses(user.uid);
        setBusinesses(savedBusinesses);

        // Auto-select business from URL or first one
        const businessId = searchParams.get('business');
        const business = businessId
          ? savedBusinesses.find((b) => b.placeId === businessId)
          : savedBusinesses[0];

        if (business) {
          setSelectedBusiness(business);
          const pageConfig = await getPageConfigWithDefaults(user.uid, business.placeId);
          // Deduplicate testimonials to prevent duplicate key errors
          pageConfig.testimonials = dedupeTestimonials(pageConfig.testimonials);
          setConfig(pageConfig);
        }
      } catch (error) {
        console.error('Error loading:', error);
        toast.error('Failed to load businesses');
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, [user, searchParams]);

  // Load config when business changes
  const handleBusinessChange = async (placeId: string) => {
    if (!user) return;
    const business = businesses.find((b) => b.placeId === placeId);
    if (!business) return;

    setSelectedBusiness(business);
    setIsLoading(true);

    try {
      const pageConfig = await getPageConfigWithDefaults(user.uid, placeId);
      // Deduplicate testimonials to prevent duplicate key errors
      pageConfig.testimonials = dedupeTestimonials(pageConfig.testimonials);
      setConfig(pageConfig);
      setHasChanges(false);

      // Update URL
      router.push(`/dashboard/editor?business=${placeId}`, { scroll: false });
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load page config');
    } finally {
      setIsLoading(false);
    }
  };

  // Update config (local state only)
  const updateConfig = (updates: Partial<PageConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Save config
  const handleSave = async () => {
    if (!user || !selectedBusiness) return;

    setIsSaving(true);
    try {
      await savePageConfig(user.uid, selectedBusiness.placeId, config);
      setHasChanges(false);
      toast.success('Changes saved!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Testimonial handlers
  const handleAddTestimonial = async (testimonial: { text: string; author: string; rating: number }) => {
    if (!user || !selectedBusiness) return;

    try {
      const id = await addTestimonial(user.uid, selectedBusiness.placeId, testimonial);
      const newTestimonial: Testimonial = {
        ...testimonial,
        id,
        createdAt: Timestamp.now(),
      };
      setConfig((prev) => ({
        ...prev,
        testimonials: [...prev.testimonials, newTestimonial],
      }));
      toast.success('Testimonial added!');
    } catch (error) {
      console.error('Error adding testimonial:', error);
      toast.error('Failed to add testimonial');
    }
  };

  const handleUpdateTestimonial = async (id: string, updates: { text?: string; author?: string; rating?: number }) => {
    if (!user || !selectedBusiness) return;

    try {
      await updateTestimonial(user.uid, selectedBusiness.placeId, id, updates);
      setConfig((prev) => ({
        ...prev,
        testimonials: prev.testimonials.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
      toast.success('Testimonial updated!');
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!user || !selectedBusiness) return;

    try {
      await deleteTestimonial(user.uid, selectedBusiness.placeId, id);
      setConfig((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
      toast.success('Testimonial removed');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to remove testimonial');
    }
  };

  // Copy link
  const handleCopyLink = async () => {
    if (!selectedBusiness) return;
    const url = `${window.location.origin}/review/${selectedBusiness.placeId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
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
      <div className="max-w-lg mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Business Added</h2>
            <p className="text-muted-foreground mb-6">
              Add a business first to customize your review page.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Review Page Editor
            </h1>
            <p className="text-muted-foreground text-sm">
              Customize what customers see before leaving a review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink} disabled={!selectedBusiness}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          {selectedBusiness && (
            <Button variant="outline" asChild>
              <Link href={`/review/${selectedBusiness.placeId}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Business Selector */}
      {businesses.length > 1 && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium whitespace-nowrap">
                Select Business:
              </Label>
              <select
                value={selectedBusiness?.placeId || ''}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
              >
                {businesses.map((business) => (
                  <option key={business.placeId} value={business.placeId}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Left: Editor */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4" />
                Header Text
              </CardTitle>
              <CardDescription>
                Customize the title and subtitle shown above the review button.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headerTitle">Title</Label>
                <Input
                  id="headerTitle"
                  value={config.headerTitle}
                  onChange={(e) => updateConfig({ headerTitle: e.target.value })}
                  placeholder="How was your experience?"
                  maxLength={60}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerSubtitle">Subtitle</Label>
                <Input
                  id="headerSubtitle"
                  value={config.headerSubtitle}
                  onChange={(e) => updateConfig({ headerSubtitle: e.target.value })}
                  placeholder="We'd love to hear your feedback!"
                  maxLength={100}
                />
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4" />
                    Testimonials
                  </CardTitle>
                  <CardDescription>
                    Add customer reviews to display on your review page.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="showTestimonials" className="text-sm">
                    Show
                  </Label>
                  <input
                    type="checkbox"
                    id="showTestimonials"
                    checked={config.showTestimonials}
                    onChange={(e) => updateConfig({ showTestimonials: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TestimonialEditor
                testimonials={config.testimonials}
                onAdd={handleAddTestimonial}
                onUpdate={handleUpdateTestimonial}
                onDelete={handleDeleteTestimonial}
                maxTestimonials={maxTestimonials}
              />
              {maxTestimonials === 3 && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Upgrade to Business for unlimited testimonials.
                </p>
              )}
            </CardContent>
          </Card>

          {/* CTA Button Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Call-to-Action Button
              </CardTitle>
              <CardDescription>
                Customize the review button text and color.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ctaButtonText">Button Text</Label>
                <Input
                  id="ctaButtonText"
                  value={config.ctaButtonText}
                  onChange={(e) => updateConfig({ ctaButtonText: e.target.value })}
                  placeholder="Leave a Review"
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <Label>Button Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateConfig({ ctaButtonColor: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        config.ctaButtonColor === color.value
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <Label htmlFor="customColor" className="text-xs">
                      Custom:
                    </Label>
                    <input
                      type="color"
                      id="customColor"
                      value={config.ctaButtonColor}
                      onChange={(e) => updateConfig({ ctaButtonColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Display Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Google Rating</Label>
                  <p className="text-xs text-muted-foreground">
                    Display your Google star rating
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.showRating}
                  onChange={(e) => updateConfig({ showRating: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Phone Preview */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-4">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                Live Preview
              </p>
            </div>
            {selectedBusiness && (
              <PhonePreview business={selectedBusiness} config={config} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
