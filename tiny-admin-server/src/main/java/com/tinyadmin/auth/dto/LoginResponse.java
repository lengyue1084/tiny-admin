package com.tinyadmin.auth.dto;

import java.time.Instant;
import java.util.List;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        Instant expiresAt,
        CurrentUserView userInfo,
        List<String> permissions
) {
}
