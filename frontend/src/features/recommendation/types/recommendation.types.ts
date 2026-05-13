export type RecommendationLocation = {
  latitude: number;
  longitude: number;
  name: string;
};

export type RecommendationPlace = {
  id: number;
  name: string;
  meta: string;
  description: string;
  tags: string[];
  location: RecommendationLocation;
};
