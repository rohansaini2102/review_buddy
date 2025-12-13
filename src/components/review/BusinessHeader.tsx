'use client';

import Image from 'next/image';
import { BusinessInfo } from '@/types';

interface BusinessHeaderProps {
  business: BusinessInfo;
}

export function BusinessHeader({ business }: BusinessHeaderProps) {
  return (
    <div className="text-center">
      {/* Business Photo */}
      {business.photoUrl ? (
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 shadow-lg">
          <Image
            src={business.photoUrl}
            alt={business.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <span className="text-4xl text-white font-bold">
            {business.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Business Name */}
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {business.name}
      </h1>

      {/* Rating */}
      {business.rating && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <StarRating rating={business.rating} />
          <span className="text-zinc-600 dark:text-zinc-400">
            {business.rating.toFixed(1)}
            {business.totalRatings && (
              <span className="text-sm"> ({business.totalRatings} reviews)</span>
            )}
          </span>
        </div>
      )}

      {/* Address */}
      {business.address && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {business.address}
        </p>
      )}
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
          className={`w-5 h-5 ${
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
