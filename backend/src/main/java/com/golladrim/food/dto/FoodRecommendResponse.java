package com.golladrim.food.dto;

import java.util.List;

public record FoodRecommendResponse(
        RecommendStatus status,
        List<FoodRecommendItem> items
) {}
