package com.golladrim.auth.oauth;

import com.golladrim.user.domain.User;
import com.golladrim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OAuth2LoginService {

    private final UserRepository userRepository;
    private final OAuth2NicknameGenerator nicknameGenerator;

    @Transactional
    public User loginOrCreate(OAuth2UserInfo userInfo) {
        validateUserInfo(userInfo);

        User user = userRepository.findByProviderAndProviderId(
                        userInfo.getProvider(),
                        userInfo.getProviderId()
                )
                .map(existingUser -> updateExistingUser(existingUser, userInfo))
                .orElseGet(() -> createNewUser(userInfo));

        validateUserStatus(user);

        return user;
    }

    private User updateExistingUser(User user, OAuth2UserInfo userInfo) {
        validateEmailNotUsedByAnotherUser(user, userInfo.getEmail());
        user.updateOAuthProfile(userInfo.getEmail(), userInfo.getName());
        return user;
    }

    private User createNewUser(OAuth2UserInfo userInfo) {
        validateEmailNotUsed(userInfo.getEmail());

        User user = User.createOAuthUser(
                userInfo.getEmail(),
                userInfo.getName(),
                nicknameGenerator.generate(userInfo.getName()),
                userInfo.getProvider(),
                userInfo.getProviderId()
        );

        return userRepository.save(user);
    }

    private void validateUserInfo(OAuth2UserInfo userInfo) {
        if (userInfo.getProviderId() == null || userInfo.getProviderId().isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_provider_id", "소셜 사용자 식별값이 없습니다.", null)
            );
        }

        if (userInfo.getName() == null || userInfo.getName().isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_name", "소셜 사용자 이름을 찾을 수 없습니다.", null)
            );
        }
    }

    private void validateUserStatus(User user) {
        user.releaseBanIfExpired();

        if (user.isDeleted()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("deleted_user", "탈퇴한 회원입니다.", null)
            );
        }

        if (!user.isActive() || user.isBanned()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("banned_user", "이용이 정지된 계정입니다.", null)
            );
        }
    }

    private void validateEmailNotUsed(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        userRepository.findByEmail(email)
                .ifPresent(user -> {
                    throw new OAuth2AuthenticationException(
                            new OAuth2Error(
                                    "email_already_registered",
                                    "이미 다른 소셜 계정으로 가입된 이메일입니다.",
                                    null
                            )
                    );
                });
    }

    private void validateEmailNotUsedByAnotherUser(User currentUser, String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        if (email.equals(currentUser.getEmail())) {
            return;
        }

        userRepository.findByEmail(email)
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .ifPresent(user -> {
                    throw new OAuth2AuthenticationException(
                            new OAuth2Error(
                                    "email_already_registered",
                                    "이미 다른 소셜 계정으로 가입된 이메일입니다.",
                                    null
                            )
                    );
                });
    }
}