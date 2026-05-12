package com.golladrim.user.dto;

import com.golladrim.user.domain.UserRole;
import jakarta.validation.constraints.NotNull;

public record ChangeUserRoleRequest(
        @NotNull(message = "권한은 필수입니다.")
        UserRole role
) {
}