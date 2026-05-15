import { axiosInstance } from "@/shared/api/axiosInstance";
import {
  FoodRecommendRequest,
  FoodRecommendResponse,
} from "@/features/recommendation/types/food.types";

export async function recommendFood(
  request: FoodRecommendRequest,
): Promise<FoodRecommendResponse> {
  const { data } = await axiosInstance.post<FoodRecommendResponse>(
    "/api/foods/recommend",
    request,
  );

  return data;
}
