package com.golladrim.user.service;

import com.golladrim.user.domain.User;
import com.golladrim.user.domain.UserRole;
import com.golladrim.user.dto.UserAdminResponse;
import com.golladrim.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public List<UserAdminResponse> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserAdminResponse::from)
                .toList();
    }

    public UserAdminResponse findUser(Long userId) {
        User user = getUser(userId);
        return UserAdminResponse.from(user);
    }

    @Transactional
    public UserAdminResponse banUser(Long userId, int days, String reason) {
        User user = getUser(userId);
        user.banUntil(LocalDateTime.now().plusDays(days), reason);
        return UserAdminResponse.from(user);
    }

    @Transactional
    public UserAdminResponse releaseBan(Long userId) {
        User user = getUser(userId);
        user.releaseBan();
        return UserAdminResponse.from(user);
    }

    @Transactional
    public UserAdminResponse changeRole(Long userId, UserRole role) {
        User user = getUser(userId);
        user.changeRole(role);
        return UserAdminResponse.from(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}