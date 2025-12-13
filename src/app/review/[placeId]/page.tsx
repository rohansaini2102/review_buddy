import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlaceDetails } from '@/lib/google-places';
import { reviewTemplates } from '@/lib/review-templates';
import { generateGoogleReviewUrl } from '@/lib/url-parser';
import { BusinessHeader } from '@/components/review/BusinessHeader';
import { ReviewTemplateList } from '@/components/review/ReviewTemplateList';

interface Props {
  params: Promise<{ placeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { placeId } = await params;

  try {
    const businessInfo = await getPlaceDetails(placeId);
    if (businessInfo) {
      return {
        title: `Leave a Review for ${businessInfo.name}`,
        description: `Share your experience with ${businessInfo.name}. Choose from our pre-written review templates to make leaving a review quick and easy.`,
      };
    }
  } catch {
    // Fall through to default
  }

  return {
    title: 'Leave a Review',
    description: 'Share your experience with pre-written review templates',
  };
}

export default async function ReviewPage({ params }: Props) {
  const { placeId } = await params;

  let businessInfo;
  try {
    businessInfo = await getPlaceDetails(placeId);
  } catch (error) {
    console.error('Error fetching place details:', error);
    notFound();
  }

  if (!businessInfo) {
    notFound();
  }

  const googleReviewUrl = generateGoogleReviewUrl(placeId);

  return (
    <main className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Business Header */}
        <BusinessHeader business={businessInfo} />

        {/* Instructions */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Choose a review template
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tap to copy, then paste on Google
          </p>
        </div>

        {/* Review Templates */}
        <div className="mt-6">
          <ReviewTemplateList templates={reviewTemplates} />
        </div>

        {/* CTA Button */}
        <div className="mt-8 sticky bottom-4">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-blue-600 text-white text-center font-semibold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Write Review on Google
          </a>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-xs text-center text-zinc-500 dark:text-zinc-500">
          Powered by Review Buddy
        </p>
      </div>
    </main>
  );
}
