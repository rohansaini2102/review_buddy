import { NextRequest, NextResponse } from 'next/server';
import { getPlaceDetails, resolveGoogleUrl } from '@/lib/google-places';
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
        { success: false, error: 'Place ID or URL required' },
        { status: 400 }
      );
    }

    // Decode the placeId in case it's URL encoded
    const decodedId = decodeURIComponent(placeId);

    let actualPlaceId: string | null = null;

    // Check if this is a URL that needs parsing/resolution
    if (decodedId.startsWith('http')) {
      const parsed = parseGoogleReviewUrl(decodedId);

      if (parsed.placeId && !parsed.needsResolution) {
        // We extracted a Place ID directly from the URL
        actualPlaceId = parsed.placeId;
      } else if (parsed.needsResolution) {
        // Need to follow redirects to resolve the URL
        console.log('Resolving URL:', decodedId);
        actualPlaceId = await resolveGoogleUrl(decodedId);

        if (!actualPlaceId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Could not extract business information from this URL. Please try a different Google Maps or review link.'
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid URL format. Please provide a Google Maps, Google Review, or g.page link.'
          },
          { status: 400 }
        );
      }
    } else if (decodedId.startsWith('ChIJ')) {
      // Direct Place ID
      actualPlaceId = decodedId;
    } else {
      // Unknown format
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input. Please provide a Place ID or Google URL.'
        },
        { status: 400 }
      );
    }

    // Fetch business details using the Place ID
    const businessInfo = await getPlaceDetails(actualPlaceId);

    if (!businessInfo) {
      return NextResponse.json(
        { success: false, error: 'Business not found. The Place ID may be invalid.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: businessInfo });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business details. Please try again.' },
      { status: 500 }
    );
  }
}
