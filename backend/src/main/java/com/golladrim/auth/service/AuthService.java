package com.golladrim.auth.service;

import com.golladrim.auth.dto.AuthUserResponse;
import com.golladrim.auth.dto.TokenResponse;
import com.golladrim.auth.dto.UpdateNicknameRequest;
import com.golladrim.auth.jwt.JwtProvider;
import com.golladrim.auth.redis.RefreshTokenService;
import com.golladrim.common.response.MessageResponse;
import com.golladrim.user.domain.User;
import com.golladrim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public AuthUserResponse getMe(User user) {
        validateAuthenticatedUser(user);
        return AuthUserResponse.from(user);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
        }

        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Refresh Token만 재발급에 사용할 수 있습니다.");
        }

        Long userId = jwtProvider.getUserId(refreshToken);

        if (!refreshTokenService.matches(userId, refreshToken)) {
            throw new IllegalArgumentException("이미 만료되었거나 무효화된 Refresh Token입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        user.releaseBanIfExpired();

        if (!user.isActive() || user.isBanned()) {
            refreshTokenService.delete(userId);
            throw new IllegalArgumentException("로그인할 수 없는 계정입니다.");
        }

        String newAccessToken = jwtProvider.createAccessToken(user);
        String newRefreshToken = jwtProvider.createRefreshToken(user);

        refreshTokenService.rotate(
                user.getId(),
                newRefreshToken,
                jwtProvider.getRefreshTokenExpirationSeconds()
        );

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public MessageResponse logout(User user, String refreshToken) {
        if (user != null) {
            validateAuthenticatedUser(user);
            refreshTokenService.delete(user.getId());
            return new MessageResponse("로그아웃 완료");
        }

        if (refreshToken != null
                && !refreshToken.isBlank()
                && jwtProvider.validateToken(refreshToken)
                && jwtProvider.isRefreshToken(refreshToken)) {
            refreshTokenService.delete(jwtProvider.getUserId(refreshToken));
        }

        return new MessageResponse("로그아웃 완료");
    }

    @Transactional
    public AuthUserResponse updateNickname(User user, UpdateNicknameRequest request) {
        validateAuthenticatedUser(user);

        String nickname = request.nickname().trim();

        if (!nickname.equals(user.getNickname())
                && userRepository.existsByNicknameAndIdNot(nickname, user.getId())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        user.updateNickname(nickname);

        return AuthUserResponse.from(user);
    }

    private void validateAuthenticatedUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        user.releaseBanIfExpired();

        if (!user.isActive() || user.isBanned()) {
            throw new IllegalArgumentException("로그인할 수 없는 계정입니다.");
        }
    }
}
