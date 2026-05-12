package com.golladrim.auth.oauth;

import com.golladrim.auth.jwt.JwtProvider;
import com.golladrim.auth.redis.RefreshTokenService;
import com.golladrim.user.domain.User;
import com.golladrim.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
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

        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

    private void redirectError(HttpServletResponse response, String message) throws IOException {
        String redirectUrl = frontendUrl + "/login"
                + "?error=oauth2"
                + "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}