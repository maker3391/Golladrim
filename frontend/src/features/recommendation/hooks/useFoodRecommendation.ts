"use client";

import { useCallback, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { recommendFood } from "@/features/recommendation/api/foodApi";
import {
  FoodRecommendItem,
  FoodRecommendResponse,
} from "@/features/recommendation/types/food.types";

type FoodRecommendStatus = FoodRecommendResponse["status"] | null;

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useFoodRecommendation() {
  const [items, setItems] = useState<FoodRecommendItem[]>([]);
  const [status, setStatus] = useState<FoodRecommendStatus>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excludedFoodIds, setExcludedFoodIds] = useState<number[]>([]);
  const [lastMessage, setLastMessage] = useState("");

  const currentFood = useMemo(() => items[0] ?? null, [items]);

  const requestRecommendation = useCallback(
    async (message: string, excludedIds: number[]) => {
      setLoading(true);
      setError(null);

      try {
        const [response] = await Promise.all([
          recommendFood({
            message,
            excludedFoodIds: excludedIds,
          }),
          delay(2500),
        ]);

        setItems(response.items);
        setStatus(response.status);
      } catch (caughtError) {
        const axiosError = caughtError as AxiosError<{ message?: string }>;
        const messageFromServer = axiosError.response?.data?.message;

        setError(messageFromServer ?? "음식 추천을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const recommend = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      setLastMessage(trimmed);
      setExcludedFoodIds([]);
      await requestRecommendation(trimmed, []);
    },
    [requestRecommendation],
  );

  const retry = useCallback(async () => {
    if (!lastMessage || !currentFood) return;

    const nextExcludedIds = Array.from(
      new Set([...excludedFoodIds, currentFood.id]),
    );

    setExcludedFoodIds(nextExcludedIds);
    await requestRecommendation(lastMessage, nextExcludedIds);
  }, [currentFood, excludedFoodIds, lastMessage, requestRecommendation]);

  return {
    items,
    status,
    loading,
    error,
    excludedFoodIds,
    currentFood,
    recommend,
    retry,
  };
}
