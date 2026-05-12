package com.golladrim.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record BanUserRequest(
        @Min(value = 1, message = "정지 일수는 1일 이상이어야 합니다.")
        @Max(value = 365, message = "정지 일수는 최대 365일입니다.")
        int days,

        @NotBlank(message = "정지 사유는 필수입니다.")
        String reason
) {
}