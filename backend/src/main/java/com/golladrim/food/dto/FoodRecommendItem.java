package com.golladrim.food.dto;

import java.util.List;

public record FoodRecommendItem(
        Long id,
        String name,
        String categoryName,
        int score,
        List<String> matchedTags,
        String reason
) {}
