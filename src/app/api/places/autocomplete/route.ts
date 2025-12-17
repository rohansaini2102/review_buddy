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

    // Use Google Places Autocomplete API (New)
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: input,
        includedPrimaryTypes: ['establishment'], // Only return businesses
        languageCode: 'en',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places Autocomplete API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform the response to our format
    const predictions: AutocompletePrediction[] = (data.suggestions || []).map((suggestion: {
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }) => {
      const place = suggestion.placePrediction;
      return {
        placeId: place?.placeId || '',
        name: place?.structuredFormat?.mainText?.text || place?.text?.text || '',
        address: place?.structuredFormat?.secondaryText?.text || '',
      };
    }).filter((p: AutocompletePrediction) => p.placeId);

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
