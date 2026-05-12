package com.golladrim.user.controller;

import com.golladrim.user.dto.BanUserRequest;
import com.golladrim.user.dto.ChangeUserRoleRequest;
import com.golladrim.user.dto.UserAdminResponse;
import com.golladrim.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<UserAdminResponse> findAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{userId}")
    public UserAdminResponse findUser(@PathVariable Long userId) {
        return userService.findUser(userId);
    }

    @PatchMapping("/{userId}/ban")
    public UserAdminResponse banUser(
            @PathVariable Long userId,
            @Valid @RequestBody BanUserRequest request
    ) {
        return userService.banUser(userId, request.days(), request.reason());
    }

    @PatchMapping("/{userId}/release-ban")
    public UserAdminResponse releaseBan(@PathVariable Long userId) {
        return userService.releaseBan(userId);
    }

    @PatchMapping("/{userId}/role")
    public UserAdminResponse changeRole(
            @PathVariable Long userId,
            @Valid @RequestBody ChangeUserRoleRequest request
    ) {
        return userService.changeRole(userId, request.role());
    }
}