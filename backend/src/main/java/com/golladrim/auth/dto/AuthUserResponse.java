package com.golladrim.auth.dto;

import com.golladrim.user.domain.OAuthProvider;
import com.golladrim.user.domain.User;
import com.golladrim.user.domain.UserRole;
import com.golladrim.user.domain.UserStatus;

public record AuthUserResponse(
        Long id,
        String email,
        String name,
        String nickname,
        OAuthProvider provider,
        UserRole role,
        UserStatus status
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getProvider(),
                user.getRole(),
                user.getStatus()
        );
    }
}