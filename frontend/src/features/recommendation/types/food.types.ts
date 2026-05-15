export type FoodRecommendRequest = {
  message: string;
  excludedFoodIds: number[];
};

export type FoodRecommendItem = {
  id: number;
  name: string;
  categoryName: string;
  score: number;
  imageUrl?: string;
  matchedTags: string[];
  reason: string;
};

export type FoodRecommendResponse = {
  status: "SUCCESS" | "FALLBACK";
  items: FoodRecommendItem[];
};

export type PanelMode = "idle" | "food" | "place";
