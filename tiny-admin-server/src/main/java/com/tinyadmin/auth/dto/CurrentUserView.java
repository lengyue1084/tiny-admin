package com.tinyadmin.auth.dto;

import java.util.List;

public record CurrentUserView(
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
