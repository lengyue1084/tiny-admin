package com.tinyadmin.infra.security;

import java.util.List;

public record CurrentUser(
        Long userId,
        String username,
        String nickName,
        Long deptId,
        String deptName,
        List<String> roles,
        List<String> permissions,
        String dataScope
) {
}
