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
 * Resolves any Google URL to get the actual Place ID
 * Follows redirects and extracts Place ID from the resolved URL
 */
export async function resolveGoogleUrl(url: string): Promise<string | null> {
  try {
    // Follow redirects to get the final URL
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReviewBuddy/1.0)'
      }
    });

    const resolvedUrl = response.url;
    const html = await response.text();

    // Try multiple extraction patterns

    // 1. Try placeid parameter in URL
    const placeIdMatch = resolvedUrl.match(/placeid=([^&]+)/i);
    if (placeIdMatch) {
      return decodeURIComponent(placeIdMatch[1]);
    }

    // 2. Try data parameter pattern (!1sChIJ...)
    const dataMatch = resolvedUrl.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
    if (dataMatch) {
      return dataMatch[1];
    }

    // 3. Try extracting from HTML meta tags or JSON-LD
    const metaMatch = html.match(/place_id["\s:]+["']?(ChIJ[a-zA-Z0-9_-]+)/i);
    if (metaMatch) {
      return metaMatch[1];
    }

    // 4. Try ftid in URL
    const ftidMatch = resolvedUrl.match(/ftid=([^&]+)/);
    if (ftidMatch) {
      // FTID is a different format, try to find ChIJ in the page
      const chijMatch = html.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
      if (chijMatch) {
        return chijMatch[1];
      }
    }

    // 5. Look for ChIJ pattern anywhere in resolved URL
    const urlChijMatch = resolvedUrl.match(/(ChIJ[a-zA-Z0-9_-]+)/);
    if (urlChijMatch) {
      return urlChijMatch[1];
    }

    // 6. Look for ChIJ in page content (last resort)
    const pageChijMatch = html.match(/"place_id"\s*:\s*"(ChIJ[a-zA-Z0-9_-]+)"/);
    if (pageChijMatch) {
      return pageChijMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Error resolving Google URL:', error);
    return null;
  }
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use resolveGoogleUrl instead
 */
export async function resolveGPageUrl(gPageUrl: string): Promise<string | null> {
  return resolveGoogleUrl(gPageUrl);
}

/**
 * Search for a place by text query (business name + location)
 * Uses the legacy Text Search API
 */
export async function searchPlaceByText(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('type', 'establishment');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    return data.results[0].place_id;
  }

  return null;
}
