'use client';

import Image from 'next/image';
import { BusinessInfo } from '@/types';
import { reviewTemplates } from '@/lib/review-templates';
import { CopyButton } from '@/components/ui/CopyButton';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSection } from './QRCodeSection';
import { Check } from 'lucide-react';

interface LivePreviewProps {
  businessInfo: BusinessInfo;
  shareableUrl: string;
  googleReviewUrl: string;
}

export function LivePreview({ businessInfo, shareableUrl, googleReviewUrl }: LivePreviewProps) {
  return (
    <div className="mt-8 space-y-6">
      {/* Phone Frame Preview */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Live Preview
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          This is exactly what your customers will see
        </p>

        {/* Phone Frame */}
        <div className="mx-auto max-w-[375px]">
          <div className="relative rounded-[3rem] border-8 border-zinc-800 dark:border-zinc-700 bg-zinc-800 p-2 shadow-xl">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 dark:bg-zinc-700 rounded-b-2xl" />

            {/* Screen Content */}
            <div className="rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 overflow-hidden h-[600px] overflow-y-auto">
              <div className="p-4 pt-8">
                {/* Business Header */}
                <div className="text-center mb-6">
                  {businessInfo.photoUrl ? (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                      <Image
                        src={businessInfo.photoUrl}
                        alt={businessInfo.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-3xl text-blue-600 dark:text-blue-400">
                        {businessInfo.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {businessInfo.name}
                  </h3>

                  {businessInfo.rating && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <StarRating rating={businessInfo.rating} />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {businessInfo.rating.toFixed(1)}
                        {businessInfo.totalRatings && ` (${businessInfo.totalRatings})`}
                      </span>
                    </div>
                  )}

                  {businessInfo.address && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 px-4">
                      {businessInfo.address}
                    </p>
                  )}
                </div>

                {/* Review Templates */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Choose a review to copy:
                  </p>
                  {reviewTemplates.slice(0, 3).map((template) => (
                    <div
                      key={template.id}
                      className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"
                    >
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        {template.title}
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {template.text}
                      </p>
                      <div className="mt-2 flex justify-end">
                        <CopyButton text={template.text} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-4 sticky bottom-0 pb-2">
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Write Review on Google
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shareable Link */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">Your shareable link is ready!</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300"
            />
            <CopyButton text={shareableUrl} variant="primary" />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
            Share this link with your customers to help them leave reviews easily
          </p>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      <QRCodeSection
        shareableUrl={shareableUrl}
        businessName={businessInfo.name}
      />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-yellow-400'
              : i === fullStars && hasHalfStar
              ? 'text-yellow-400'
              : 'text-zinc-300 dark:text-zinc-600'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
