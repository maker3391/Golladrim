package com.golladrim.auth.controller;

import com.golladrim.auth.dto.AuthUserResponse;
import com.golladrim.auth.dto.RefreshTokenRequest;
import com.golladrim.auth.dto.TokenResponse;
import com.golladrim.auth.dto.UpdateNicknameRequest;
import com.golladrim.auth.service.AuthService;
import com.golladrim.common.response.MessageResponse;
import com.golladrim.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getMe(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.logout(user));
    }

    @PatchMapping("/me/nickname")
    public ResponseEntity<AuthUserResponse> updateNickname(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateNicknameRequest request
    ) {
        return ResponseEntity.ok(authService.updateNickname(user, request));
    }
}