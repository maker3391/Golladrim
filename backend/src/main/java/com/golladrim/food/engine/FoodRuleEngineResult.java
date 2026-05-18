package com.golladrim.food.engine;

import com.golladrim.food.dto.FoodRecommendItem;
import com.golladrim.food.dto.RecommendStatus;

import java.util.List;

public record FoodRuleEngineResult(
        RecommendStatus status,
        List<FoodRecommendItem> items
) {}
