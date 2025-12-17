import { NextRequest, NextResponse } from 'next/server';

interface AutocompletePrediction {
  placeId: string;
  name: string;
  address: string;
}

interface AutocompleteResponse {
  success: boolean;
  predictions?: AutocompletePrediction[];
  error?: string;
}

// Legacy Google Places API response types
interface LegacyPrediction {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
  description: string;
}

interface LegacyAutocompleteResponse {
  status: string;
  predictions?: LegacyPrediction[];
  error_message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<AutocompleteResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');

    if (!input || input.length < 2) {
      return NextResponse.json({
        success: true,
        predictions: [],
      });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Places API not configured' },
        { status: 500 }
      );
    }

    // Use Legacy Google Places Autocomplete API (more reliable)
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('types', 'establishment'); // Only return businesses
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places Autocomplete API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    const data: LegacyAutocompleteResponse = await response.json();

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API status:', data.status, data.error_message);
      return NextResponse.json(
        { success: false, error: data.error_message || 'API error' },
        { status: 500 }
      );
    }

    // Transform the response to our format
    const predictions: AutocompletePrediction[] = (data.predictions || []).map((prediction) => ({
      placeId: prediction.place_id,
      name: prediction.structured_formatting?.main_text || prediction.description,
      address: prediction.structured_formatting?.secondary_text || '',
    })).filter((p) => p.placeId);

    return NextResponse.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
