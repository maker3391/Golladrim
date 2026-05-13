package com.golladrim.auth.controller;

import com.golladrim.auth.dto.AuthUserResponse;
import com.golladrim.auth.dto.TokenResponse;
import com.golladrim.auth.dto.UpdateNicknameRequest;
import com.golladrim.auth.service.AuthService;
import com.golladrim.common.response.MessageResponse;
import com.golladrim.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final Duration ACCESS_TOKEN_MAX_AGE = Duration.ofMinutes(30);
    private static final Duration REFRESH_TOKEN_MAX_AGE = Duration.ofDays(14);

    private final AuthService authService;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getMe(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<MessageResponse> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh Token이 없습니다.");
        }

        TokenResponse tokenResponse = authService.refresh(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createAccessTokenCookie(tokenResponse.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(tokenResponse.refreshToken()).toString())
                .body(new MessageResponse("토큰 재발급 완료"));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @AuthenticationPrincipal User user,
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken
    ) {
        authService.logout(user, refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expireCookie(ACCESS_TOKEN_COOKIE_NAME).toString())
                .header(HttpHeaders.SET_COOKIE, expireCookie(REFRESH_TOKEN_COOKIE_NAME).toString())
                .body(new MessageResponse("로그아웃 완료"));
    }

    @PatchMapping("/me/nickname")
    public ResponseEntity<AuthUserResponse> updateNickname(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateNicknameRequest request
    ) {
        return ResponseEntity.ok(authService.updateNickname(user, request));
    }

    private ResponseCookie createAccessTokenCookie(String accessToken) {
        return ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, accessToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .maxAge(ACCESS_TOKEN_MAX_AGE)
                .path("/")
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .path("/")
                .build();
    }

    private ResponseCookie expireCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .maxAge(0)
                .path("/")
                .build();
    }
}
