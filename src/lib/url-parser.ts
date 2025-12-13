/**
 * Parses various Google review URL formats and extracts the Place ID
 *
 * Supported formats:
 * 1. g.page short URL: https://g.page/r/CXlUl0ZZohrjEAE/review
 * 2. Direct PlaceID: https://search.google.com/local/writereview?placeid=ChIJ...
 * 3. Maps URL: https://www.google.com/maps/place/...
 */

export interface ParsedUrl {
  placeId: string | null;
  originalUrl: string;
  type: 'g.page' | 'placeid' | 'maps' | 'direct' | 'unknown';
}

export function parseGoogleReviewUrl(input: string): ParsedUrl {
  const trimmedInput = input.trim();

  // Check if input is already a Place ID (starts with "ChIJ" or similar patterns)
  if (/^ChIJ[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
    return {
      placeId: trimmedInput,
      originalUrl: trimmedInput,
      type: 'direct'
    };
  }

  try {
    const url = new URL(trimmedInput);

    // Handle search.google.com/local/writereview?placeid=XXX
    if (url.hostname.includes('google.com') && url.searchParams.has('placeid')) {
      return {
        placeId: url.searchParams.get('placeid'),
        originalUrl: trimmedInput,
        type: 'placeid'
      };
    }

    // Handle g.page/r/ format
    // This format needs to be resolved server-side to get the actual Place ID
    if (url.hostname === 'g.page') {
      const pathMatch = url.pathname.match(/\/r\/([^/]+)/);
      if (pathMatch) {
        // Return the g.page identifier - will need server-side resolution
        return {
          placeId: pathMatch[1], // This is the g.page identifier, not the Place ID
          originalUrl: trimmedInput,
          type: 'g.page'
        };
      }
    }

    // Handle google.com/maps URLs with data parameter
    if (url.hostname.includes('google.com') && url.pathname.includes('/maps/')) {
      // Try to extract Place ID from various URL patterns
      const dataMatch = url.href.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
      if (dataMatch) {
        return {
          placeId: dataMatch[1],
          originalUrl: trimmedInput,
          type: 'maps'
        };
      }

      // Try place_id in URL
      const placeIdMatch = url.href.match(/place_id[=:]([^&/]+)/);
      if (placeIdMatch) {
        return {
          placeId: placeIdMatch[1],
          originalUrl: trimmedInput,
          type: 'maps'
        };
      }
    }

  } catch {
    // Invalid URL
  }

  return {
    placeId: null,
    originalUrl: trimmedInput,
    type: 'unknown'
  };
}

/**
 * Generates the review page URL for sharing with customers
 */
export function generateReviewPageUrl(placeId: string, baseUrl: string): string {
  return `${baseUrl}/review/${encodeURIComponent(placeId)}`;
}

/**
 * Generates the Google review URL from a Place ID
 */
export function generateGoogleReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}
