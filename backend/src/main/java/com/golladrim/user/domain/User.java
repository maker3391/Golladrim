package com.golladrim.user.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_provider_provider_id", columnNames = {"provider", "provider_id"}),
                @UniqueConstraint(name = "uk_users_nickname", columnNames = "nickname")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OAuthProvider provider;

    @Column(name = "provider_id", nullable = false, length = 100)
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;

    @Column(name = "ban_reason", length = 255)
    private String banReason;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static User createOAuthUser(
            String email,
            String name,
            String nickname,
            OAuthProvider provider,
            String providerId
    ) {
        User user = new User();
        user.email = email;
        user.name = name;
        user.nickname = nickname;
        user.provider = provider;
        user.providerId = providerId;
        user.role = UserRole.USER;
        user.status = UserStatus.ACTIVE;
        return user;
    }

    public void updateOAuthProfile(String email, String name) {
        if (email != null && !email.isBlank()) {
            this.email = email;
        }

        if (name != null && !name.isBlank()) {
            this.name = name;
        }
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public boolean isBanned() {
        return bannedUntil != null && bannedUntil.isAfter(LocalDateTime.now());
    }

    public boolean isDeleted() {
        return status == UserStatus.DELETED;
    }

    public boolean isActive() {
        if (status == UserStatus.ACTIVE) {
            return true;
        }

        return status == UserStatus.BANNED
                && bannedUntil != null
                && !bannedUntil.isAfter(LocalDateTime.now());
    }

    public void banUntil(LocalDateTime bannedUntil, String banReason) {
        this.status = UserStatus.BANNED;
        this.bannedUntil = bannedUntil;
        this.banReason = banReason;
    }

    public void releaseBan() {
        this.status = UserStatus.ACTIVE;
        this.bannedUntil = null;
        this.banReason = null;
    }

    public void releaseBanIfExpired() {
        if (status == UserStatus.BANNED
                && bannedUntil != null
                && !bannedUntil.isAfter(LocalDateTime.now())) {
            releaseBan();
        }
    }

    public void changeRole(UserRole role) {
        this.role = role;
    }
}