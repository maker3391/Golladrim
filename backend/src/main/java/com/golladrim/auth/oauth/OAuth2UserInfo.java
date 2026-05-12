package com.golladrim.auth.oauth;

import com.golladrim.user.domain.OAuthProvider;

public interface OAuth2UserInfo {

    String getEmail();

    String getName();

    OAuthProvider getProvider();

    String getProviderId();
}