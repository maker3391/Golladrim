package com.golladrim.user.dto;

import com.golladrim.user.domain.OAuthProvider;
import com.golladrim.user.domain.User;
import com.golladrim.user.domain.UserRole;
import com.golladrim.user.domain.UserStatus;

import java.time.LocalDateTime;

public record UserAdminResponse(
        Long id,
        String email,
        String name,
        String nickname,
        OAuthProvider provider,
        UserRole role,
        UserStatus status,
        LocalDateTime bannedUntil,
        String banReason,
        LocalDateTime createdAt
) {
    public static UserAdminResponse from(User user) {
        return new UserAdminResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getProvider(),
                user.getRole(),
                user.getStatus(),
                user.getBannedUntil(),
                user.getBanReason(),
                user.getCreatedAt()
        );
    }
}