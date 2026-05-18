export type RecommendationLocation = {
  latitude: number;
  longitude: number;
  name: string;
};

export type PlaceRecommendRequest = {
  foodId: number;
  foodName: string;
  latitude: number;
  longitude: number;
};

export type PlaceResponse = {
  placeName: string;
  categoryName: string;
  addressName: string;
  roadAddressName: string;
  phone: string;
  placeUrl: string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
};

export type PlaceRecommendResponse = {
  foodId: number;
  foodName: string;
  places: PlaceResponse[];
  message?: string | null;
};

export type GeocodeResponse = {
  address: string;
};

export type RecommendationPlace = {
  id: number;
  name: string;
  meta: string;
  description: string;
  tags: string[];
  location: RecommendationLocation;
};
