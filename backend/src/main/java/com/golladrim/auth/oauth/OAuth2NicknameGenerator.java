package com.golladrim.auth.oauth;

import com.golladrim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2NicknameGenerator {

    private final UserRepository userRepository;

    public String generate(String baseNickname) {
        String nickname = baseNickname == null || baseNickname.isBlank()
                ? "user"
                : baseNickname.trim();

        if (nickname.length() > 20) {
            nickname = nickname.substring(0, 20);
        }

        String candidate = nickname;
        int suffix = 1;

        while (userRepository.existsByNickname(candidate)) {
            String suffixText = String.valueOf(suffix);
            int maxBaseLength = 30 - suffixText.length();

            String shortenedBase = nickname.length() > maxBaseLength
                    ? nickname.substring(0, maxBaseLength)
                    : nickname;

            candidate = shortenedBase + suffixText;
            suffix++;
        }

        return candidate;
    }
}