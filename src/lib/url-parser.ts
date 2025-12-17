/**
 * Parses various Google review URL formats and extracts the Place ID or identifier
 *
 * Supported formats:
 * 1. g.page short URL: https://g.page/r/CXlUl0ZZohrjEAE/review
 * 2. Direct PlaceID in URL: https://search.google.com/local/writereview?placeid=ChIJ...
 * 3. Maps URL with data: https://www.google.com/maps/place/...!1sChIJ...
 * 4. Maps URL with CID: https://maps.google.com/maps?cid=12345678901234567890
 * 5. Direct Place ID: ChIJ...
 * 6. Maps place URL: https://www.google.com/maps/place/Business+Name/@lat,lng,zoom/data=...
 */

export interface ParsedUrl {
  placeId: string | null;
  cid: string | null;
  originalUrl: string;
  type: 'g.page' | 'placeid' | 'maps' | 'cid' | 'direct' | 'unknown';
  needsResolution: boolean; // True if we need to follow redirects to get Place ID
}

export function parseGoogleReviewUrl(input: string): ParsedUrl {
  const trimmedInput = input.trim();

  // Default result for unknown URLs
  const unknownResult: ParsedUrl = {
    placeId: null,
    cid: null,
    originalUrl: trimmedInput,
    type: 'unknown',
    needsResolution: false,
  };

  // Check if input is already a Place ID (starts with "ChIJ" or similar patterns)
  if (/^ChIJ[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
    return {
      placeId: trimmedInput,
      cid: null,
      originalUrl: trimmedInput,
      type: 'direct',
      needsResolution: false,
    };
  }

  try {
    const url = new URL(trimmedInput);
    const hostname = url.hostname.toLowerCase();

    // Handle search.google.com/local/writereview?placeid=XXX
    if (hostname.includes('google.com') && url.searchParams.has('placeid')) {
      return {
        placeId: url.searchParams.get('placeid'),
        cid: null,
        originalUrl: trimmedInput,
        type: 'placeid',
        needsResolution: false,
      };
    }

    // Handle CID format: maps.google.com/maps?cid=XXX
    if (hostname.includes('google.com') && url.searchParams.has('cid')) {
      const cid = url.searchParams.get('cid');
      return {
        placeId: null,
        cid: cid,
        originalUrl: trimmedInput,
        type: 'cid',
        needsResolution: true, // CID needs to be resolved to Place ID
      };
    }

    // Handle g.page/r/ format - needs server-side resolution
    if (hostname === 'g.page' || hostname === 'www.g.page') {
      return {
        placeId: null,
        cid: null,
        originalUrl: trimmedInput,
        type: 'g.page',
        needsResolution: true,
      };
    }

    // Handle google.com/maps URLs
    if (hostname.includes('google.com') && url.pathname.includes('/maps')) {
      // Try to extract Place ID from data parameter (!1sChIJ...)
      const dataMatch = url.href.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
      if (dataMatch) {
        return {
          placeId: dataMatch[1],
          cid: null,
          originalUrl: trimmedInput,
          type: 'maps',
          needsResolution: false,
        };
      }

      // Try place_id in URL
      const placeIdMatch = url.href.match(/place_id[=:]([^&/]+)/);
      if (placeIdMatch) {
        return {
          placeId: placeIdMatch[1],
          cid: null,
          originalUrl: trimmedInput,
          type: 'maps',
          needsResolution: false,
        };
      }

      // Try ftid parameter (another Google format)
      const ftidMatch = url.href.match(/ftid=(0x[a-f0-9]+:[a-f0-9x]+)/i);
      if (ftidMatch) {
        // FTID needs resolution
        return {
          placeId: null,
          cid: ftidMatch[1],
          originalUrl: trimmedInput,
          type: 'maps',
          needsResolution: true,
        };
      }

      // If it's a maps URL but we couldn't extract data, mark for resolution
      if (url.pathname.includes('/place/') || url.href.includes('/maps/place/')) {
        return {
          placeId: null,
          cid: null,
          originalUrl: trimmedInput,
          type: 'maps',
          needsResolution: true,
        };
      }
    }

    // Handle maps.app.goo.gl short links - need resolution
    if (hostname.includes('goo.gl') || hostname.includes('maps.app.goo.gl')) {
      return {
        placeId: null,
        cid: null,
        originalUrl: trimmedInput,
        type: 'maps',
        needsResolution: true,
      };
    }

  } catch {
    // Invalid URL - might still be useful input
  }

  // If input looks like a URL but wasn't parsed, mark as needing resolution
  if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
    return {
      placeId: null,
      cid: null,
      originalUrl: trimmedInput,
      type: 'unknown',
      needsResolution: true, // Try to resolve it anyway
    };
  }

  return unknownResult;
}

/**
 * Check if input is any kind of URL that might contain business info
 */
export function isGoogleUrl(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  return (
    trimmed.includes('google.com') ||
    trimmed.includes('g.page') ||
    trimmed.includes('goo.gl') ||
    trimmed.includes('maps.app.goo.gl')
  );
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
