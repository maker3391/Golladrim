package com.golladrim.auth.oauth;

import com.golladrim.user.domain.OAuthProvider;

import java.util.Map;

public class KakaoOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getEmail() {
        Map<String, Object> kakaoAccount = getKakaoAccount();
        return kakaoAccount == null ? null : (String) kakaoAccount.get("email");
    }

    @Override
    public String getName() {
        Map<String, Object> properties = getProperties();
        String nickname = properties == null ? null : (String) properties.get("nickname");
        return nickname == null || nickname.isBlank() ? "kakao_" + getProviderId() : nickname;
    }

    @Override
    public OAuthProvider getProvider() {
        return OAuthProvider.KAKAO;
    }

    @Override
    public String getProviderId() {
        Object id = attributes.get("id");
        return id == null ? null : String.valueOf(id);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getKakaoAccount() {
        return (Map<String, Object>) attributes.get("kakao_account");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getProperties() {
        return (Map<String, Object>) attributes.get("properties");
    }
}