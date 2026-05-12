package com.golladrim.auth.redis;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("refresh_token")
public class RefreshToken {

    @Id
    private String id;

    private String token;

    @TimeToLive
    private Long ttl;

    public static RefreshToken create(Long userId, String token, Long ttl) {
        return new RefreshToken(String.valueOf(userId), token, ttl);
    }
}