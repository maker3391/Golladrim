package com.golladrim.auth.oauth;

import com.golladrim.auth.jwt.JwtProvider;
import com.golladrim.auth.redis.RefreshTokenService;
import com.golladrim.user.domain.User;
import com.golladrim.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;

    private static final Duration ACCESS_TOKEN_MAX_AGE = Duration.ofMinutes(30);
    private static final Duration REFRESH_TOKEN_MAX_AGE = Duration.ofDays(14);

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        try {
            handleSuccess(response, authentication);
        } catch (Exception e) {
            log.error("OAuth2 success handling failed", e);
            redirectError(response, "소셜 로그인 처리 중 문제가 발생했습니다.");
        }
    }

    private void handleSuccess(
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        Object userIdValue = oAuth2User.getAttributes().get("userId");

        if (userIdValue == null) {
            redirectError(response, "소셜 사용자 정보를 찾을 수 없습니다.");
            return;
        }

        Long userId = Long.valueOf(String.valueOf(userIdValue));

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null || !user.isActive() || user.isBanned()) {
            redirectError(response, "로그인할 수 없는 계정입니다.");
            return;
        }

        String accessToken = jwtProvider.createAccessToken(user);
        String refreshToken = jwtProvider.createRefreshToken(user);

        refreshTokenService.save(
                user.getId(),
                refreshToken,
                jwtProvider.getRefreshTokenExpirationSeconds()
        );

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .maxAge(ACCESS_TOKEN_MAX_AGE)
                .path("/")
                .build();

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .path("/")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        String redirectUrl = frontendUrl + "/oauth2/callback";

        response.sendRedirect(redirectUrl);
    }

    private void redirectError(HttpServletResponse response, String message) throws IOException {
        String redirectUrl = frontendUrl + "/"
                + "?error=oauth2"
                + "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}
