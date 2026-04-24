package com.tinyadmin.infra.security;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthSession implements Serializable {
    private String sessionId;
    private Long userId;
    private String username;
    private List<String> permissions;
    private List<String> roleCodes;
    private Instant loginTime;
    private Instant lastActiveTime;
    private Instant expiresAt;
}
