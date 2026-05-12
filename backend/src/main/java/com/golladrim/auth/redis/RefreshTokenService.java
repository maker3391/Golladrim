package com.golladrim.auth.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public void save(Long userId, String refreshToken, long ttlSeconds) {
        refreshTokenRepository.save(
                RefreshToken.create(userId, refreshToken, ttlSeconds)
        );
    }

    public String get(Long userId) {
        return refreshTokenRepository.findById(String.valueOf(userId))
                .map(RefreshToken::getToken)
                .orElse(null);
    }

    public boolean matches(Long userId, String refreshToken) {
        String savedToken = get(userId);
        return savedToken != null && savedToken.equals(refreshToken);
    }

    public void delete(Long userId) {
        refreshTokenRepository.deleteById(String.valueOf(userId));
    }

    public void rotate(Long userId, String refreshToken, long ttlSeconds) {
        save(userId, refreshToken, ttlSeconds);
    }
}