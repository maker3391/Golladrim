package com.golladrim.auth.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {
}