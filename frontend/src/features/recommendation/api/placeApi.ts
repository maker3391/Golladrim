import { axiosInstance } from "@/shared/api/axiosInstance";
import {
  PlaceRecommendRequest,
  PlaceRecommendResponse,
} from "@/features/recommendation/types/recommendation.types";

export async function recommendPlaces(
  request: PlaceRecommendRequest,
): Promise<PlaceRecommendResponse> {
  const { data } = await axiosInstance.post<PlaceRecommendResponse>(
    "/api/places/recommend",
    request,
  );

  return data;
}
