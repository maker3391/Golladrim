package com.golladrim.food.dto;

import java.util.List;

public record FoodRecommendItem(
        Long id,
        String name,
        String categoryName,
        String imageUrl,
        int score,
        List<String> matchedTags,
        String reason
) {}
