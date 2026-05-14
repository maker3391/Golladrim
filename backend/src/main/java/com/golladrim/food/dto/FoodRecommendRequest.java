package com.golladrim.food.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FoodRecommendRequest(
        @NotBlank(message = "추천 문장을 입력해 주세요.")
        @Size(max = 300, message = "추천 문장은 300자 이하로 입력해 주세요.")
        String message,
        List<@NotNull Long> excludedFoodIds
) {
    public FoodRecommendRequest {
        excludedFoodIds = excludedFoodIds == null ? List.of() : List.copyOf(excludedFoodIds);
    }
}
