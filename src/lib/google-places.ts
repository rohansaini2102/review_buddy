import { BusinessInfo, GooglePlacesResponse } from '@/types';

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

/**
 * Fetches place details from Google Places API (New)
 */
export async function getPlaceDetails(placeId: string): Promise<BusinessInfo | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY not configured');
  }

  const response = await fetch(`${PLACES_API_BASE}/${placeId}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,photos,rating,userRatingCount,websiteUri,nationalPhoneNumber'
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text();
    console.error('Places API error:', response.status, errorText);
    throw new Error(`Places API error: ${response.status}`);
  }

  const data: GooglePlacesResponse = await response.json();

  return transformPlaceData(data);
}

/**
 * Transforms Google Places API response to our BusinessInfo format
 */
function transformPlaceData(data: GooglePlacesResponse): BusinessInfo {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  let photoUrl: string | null = null;
  if (data.photos && data.photos.length > 0 && apiKey) {
    // Use the photo reference to construct the photo URL
    const photoName = data.photos[0].name;
    photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=400`;
  }

  return {
    placeId: data.id,
    name: data.displayName?.text || 'Unknown Business',
    address: data.formattedAddress || '',
    photoUrl,
    rating: data.rating || null,
    totalRatings: data.userRatingCount || null,
    websiteUri: data.websiteUri,
    phoneNumber: data.nationalPhoneNumber
  };
}

/**
 * Resolves a g.page URL to get the actual Place ID
 * This follows the redirect and extracts the Place ID from the resolved URL
 */
export async function resolveGPageUrl(gPageUrl: string): Promise<string | null> {
  try {
    // Follow the redirect to get the resolved URL
    const response = await fetch(gPageUrl, {
      method: 'HEAD',
      redirect: 'follow'
    });

    const resolvedUrl = response.url;

    // Try to extract Place ID from the resolved URL
    const placeIdMatch = resolvedUrl.match(/placeid=([^&]+)/);
    if (placeIdMatch) {
      return placeIdMatch[1];
    }

    // Try data parameter pattern
    const dataMatch = resolvedUrl.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
    if (dataMatch) {
      return dataMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Error resolving g.page URL:', error);
    return null;
  }
}
