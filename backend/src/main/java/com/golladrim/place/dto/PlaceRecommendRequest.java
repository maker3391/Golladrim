package com.golladrim.place.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PlaceRecommendRequest(
        @NotNull(message = "음식 ID를 입력해 주세요.")
        Long foodId,

        @NotBlank(message = "음식 이름을 입력해 주세요.")
        String foodName,

        @NotNull(message = "위도 정보를 입력해 주세요.")
        Double latitude,

        @NotNull(message = "경도 정보를 입력해 주세요.")
        Double longitude,

        Integer radius
) {}
