import { NextRequest, NextResponse } from 'next/server';
import { getPlaceDetails, resolveGPageUrl } from '@/lib/google-places';
import { parseGoogleReviewUrl } from '@/lib/url-parser';
import { PlacesApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
): Promise<NextResponse<PlacesApiResponse>> {
  try {
    const { placeId } = await params;

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'Place ID required' },
        { status: 400 }
      );
    }

    // Decode the placeId in case it's URL encoded
    const decodedId = decodeURIComponent(placeId);

    // Check if this might be a full URL that needs parsing
    let actualPlaceId = decodedId;

    if (decodedId.startsWith('http')) {
      const parsed = parseGoogleReviewUrl(decodedId);

      if (parsed.type === 'g.page' && parsed.placeId) {
        // Need to resolve g.page URL to get actual Place ID
        const resolvedId = await resolveGPageUrl(decodedId);
        if (!resolvedId) {
          return NextResponse.json(
            { success: false, error: 'Could not resolve g.page URL. Please provide a direct Place ID.' },
            { status: 400 }
          );
        }
        actualPlaceId = resolvedId;
      } else if (parsed.placeId) {
        actualPlaceId = parsed.placeId;
      } else {
        return NextResponse.json(
          { success: false, error: 'Could not extract Place ID from URL' },
          { status: 400 }
        );
      }
    }

    const businessInfo = await getPlaceDetails(actualPlaceId);

    if (!businessInfo) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: businessInfo });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business details' },
      { status: 500 }
    );
  }
}
