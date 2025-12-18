'use client';

import Image from 'next/image';
import { SavedBusiness, PageConfig, Testimonial } from '@/lib/firestore';
import { Star, ExternalLink, Quote } from 'lucide-react';

interface PhonePreviewProps {
  business: SavedBusiness;
  config: PageConfig;
  className?: string;
}

export function PhonePreview({ business, config, className }: PhonePreviewProps) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden overflow-y-auto">
          {/* Content */}
          <div className="min-h-full bg-gradient-to-b from-slate-50 to-white">
            {/* Business Header */}
            <div className="p-4 pt-8">
              {/* Business Photo */}
              {business.photoUrl && (
                <div className="relative w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={business.photoUrl}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Business Name */}
              <h2 className="text-sm font-semibold text-gray-900 text-center line-clamp-2">
                {business.name}
              </h2>

              {/* Rating */}
              {config.showRating && business.rating && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(business.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {business.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Header Text */}
            <div className="px-4 pb-4 text-center">
              <h1 className="text-base font-bold text-gray-900 mb-1">
                {config.headerTitle}
              </h1>
              <p className="text-xs text-gray-500">
                {config.headerSubtitle}
              </p>
            </div>

            {/* Testimonials */}
            {config.showTestimonials && config.testimonials.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {config.testimonials.slice(0, 3).map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            )}

            {/* CTA Button */}
            <div className="px-4 pb-6">
              <button
                className="w-full py-2.5 rounded-lg text-white text-sm font-medium shadow-md transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: config.ctaButtonColor }}
              >
                {config.ctaButtonText}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Powered by */}
            <div className="px-4 pb-4 text-center">
              <p className="text-[10px] text-gray-400">
                Powered by Review Buddy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <div className="flex gap-2">
        <Quote className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 line-clamp-3">{testimonial.text}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400 font-medium">
              — {testimonial.author}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-2.5 h-2.5 ${
                    star <= testimonial.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
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
