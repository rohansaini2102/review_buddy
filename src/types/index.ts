// Business data from Google Places API
export interface BusinessInfo {
  placeId: string;
  name: string;
  address: string;
  photoUrl: string | null;
  rating: number | null;
  totalRatings: number | null;
  websiteUri?: string;
  phoneNumber?: string;
}

// Review template structure
export interface ReviewTemplate {
  id: string;
  title: string;
  text: string;
  category: 'positive' | 'detailed' | 'professional';
}

// API response types
export interface PlacesApiResponse {
  success: boolean;
  data?: BusinessInfo;
  error?: string;
}

// Google Places API raw response types
export interface GooglePlacesResponse {
  id: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: GooglePlacePhoto[];
  websiteUri?: string;
  nationalPhoneNumber?: string;
}

export interface GooglePlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}
