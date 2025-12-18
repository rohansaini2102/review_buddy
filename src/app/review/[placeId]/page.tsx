import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlaceDetails } from '@/lib/google-places';
import { generateGoogleReviewUrl } from '@/lib/url-parser';
import { ReviewPageClient } from './ReviewPageClient';

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
        description: `Share your experience with ${businessInfo.name}. Your feedback helps us improve!`,
      };
    }
  } catch {
    // Fall through to default
  }

  return {
    title: 'Leave a Review',
    description: 'Share your experience and help others discover great businesses.',
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
    <ReviewPageClient
      placeId={placeId}
      businessInfo={businessInfo}
      googleReviewUrl={googleReviewUrl}
    />
  );
}
