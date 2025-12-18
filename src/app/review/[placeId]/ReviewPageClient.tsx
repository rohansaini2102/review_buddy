'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPublicPageConfig, PageConfig, DEFAULT_PAGE_CONFIG, Testimonial } from '@/lib/firestore';
import { trackEvent } from '@/lib/analytics';
import { Star, ExternalLink, Quote, Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface BusinessInfo {
  placeId: string;
  name: string;
  address?: string;
  photoUrl?: string | null;
  rating?: number | null;
  totalRatings?: number | null;
}

interface ReviewPageClientProps {
  placeId: string;
  businessInfo: BusinessInfo;
  googleReviewUrl: string;
}

export function ReviewPageClient({ placeId, businessInfo, googleReviewUrl }: ReviewPageClientProps) {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch page config and track page view
  useEffect(() => {
    async function loadConfig() {
      try {
        // Fetch page config
        const result = await getPublicPageConfig(placeId);
        if (result) {
          setConfig(result.config);
        } else {
          // Use defaults if no config found
          setConfig({
            ...DEFAULT_PAGE_CONFIG,
            updatedAt: Timestamp.now(),
          });
        }

        // Track page view
        trackEvent(placeId, 'page_view');
      } catch (error) {
        console.error('Error loading page config:', error);
        // Fall back to defaults
        setConfig({
          ...DEFAULT_PAGE_CONFIG,
          updatedAt: Timestamp.now(),
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [placeId]);

  // Handle CTA click
  const handleCtaClick = () => {
    trackEvent(placeId, 'button_click');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Business Header */}
        <div className="text-center">
          {/* Business Photo */}
          {businessInfo.photoUrl && (
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={businessInfo.photoUrl}
                alt={businessInfo.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Business Name */}
          <h1 className="text-xl font-bold text-slate-900">
            {businessInfo.name}
          </h1>

          {/* Address */}
          {businessInfo.address && (
            <p className="text-sm text-slate-500 mt-1">
              {businessInfo.address}
            </p>
          )}

          {/* Rating */}
          {config?.showRating && businessInfo.rating && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(businessInfo.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600 font-medium">
                {businessInfo.rating.toFixed(1)}
              </span>
              {businessInfo.totalRatings && (
                <span className="text-sm text-slate-400">
                  ({businessInfo.totalRatings.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Header Text */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {config?.headerTitle || DEFAULT_PAGE_CONFIG.headerTitle}
          </h2>
          <p className="text-slate-500 mt-1">
            {config?.headerSubtitle || DEFAULT_PAGE_CONFIG.headerSubtitle}
          </p>
        </div>

        {/* Testimonials */}
        {config?.showTestimonials && config.testimonials && config.testimonials.length > 0 && (
          <div className="mt-8 space-y-3">
            {config.testimonials.slice(0, 5).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-8 sticky bottom-4">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 text-white text-center font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:opacity-90"
            style={{ backgroundColor: config?.ctaButtonColor || DEFAULT_PAGE_CONFIG.ctaButtonColor }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {config?.ctaButtonText || DEFAULT_PAGE_CONFIG.ctaButtonText}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-center text-slate-400">
          Powered by Review Buddy
        </p>
      </div>
    </main>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex gap-3">
        <Quote className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 leading-relaxed">
            "{testimonial.text}"
          </p>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              — {testimonial.author}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= testimonial.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
