"use client";

import { useCallback, useState } from "react";
import { recommendPlaces as postRecommendPlaces } from "@/features/recommendation/api/placeApi";
import {
  PlaceRecommendRequest,
  PlaceRecommendResponse,
} from "@/features/recommendation/types/recommendation.types";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function usePlaceRecommendation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendPlaces = useCallback(
    async (request: PlaceRecommendRequest): Promise<PlaceRecommendResponse | null> => {
      if (isLoading) return null;
      setIsLoading(true);
      setError(null);

      try {
        const [response] = await Promise.all([
          postRecommendPlaces(request),
          delay(2500),
        ]);

        return response;
      } catch (caughtError) {
        const message = getApiErrorMessage(
          caughtError,
          "근처 맛집을 불러오지 못했어요.",
        );
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  return {
    recommendPlaces,
    isLoading,
    error,
  };
}
