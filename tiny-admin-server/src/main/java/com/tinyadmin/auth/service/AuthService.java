package com.tinyadmin.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.audit.domain.OnlineUserEntity;
import com.tinyadmin.audit.service.AuditService;
import com.tinyadmin.auth.dto.CurrentUserView;
import com.tinyadmin.auth.dto.LoginRequest;
import com.tinyadmin.auth.dto.LoginResponse;
import com.tinyadmin.common.exception.BizException;
import com.tinyadmin.infra.security.AuthSession;
import com.tinyadmin.infra.security.JwtTokenProvider;
import com.tinyadmin.infra.security.SecurityUtils;
import com.tinyadmin.infra.store.SessionStore;
import com.tinyadmin.system.domain.MenuEntity;
import com.tinyadmin.system.domain.RoleEntity;
import com.tinyadmin.system.domain.UserEntity;
import com.tinyadmin.system.mapper.UserMapper;
import com.tinyadmin.system.service.SystemLookupService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CaptchaService captchaService;
    private final SystemLookupService systemLookupService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SessionStore sessionStore;
    private final AuditService auditService;
    private final UserMapper userMapper;

    public LoginResponse login(LoginRequest request, HttpServletRequest httpServletRequest) {
        if (!captchaService.validate(request.captchaKey(), request.captchaCode())) {
            auditService.saveLoginLog(request.username(), clientIp(httpServletRequest), "FAIL", "验证码错误");
            throw new BizException("A0401", "验证码错误");
        }
        captchaService.clear(request.captchaKey());

        UserEntity user = systemLookupService.requireUserByUsername(request.username());
        if (user == null || !passwordMatches(request.password(), user.getPassword())) {
            auditService.saveLoginLog(request.username(), clientIp(httpServletRequest), "FAIL", "用户名或密码错误");
            throw new BizException("A0401", "用户名或密码错误");
        }

        List<RoleEntity> roles = systemLookupService.getRolesByUserId(user.getId());
        List<MenuEntity> menus = systemLookupService.getMenusByUserId(user.getId());
        List<String> permissions = menus.stream()
                .map(MenuEntity::getPermissionCode)
                .filter(permission -> permission != null && !permission.isBlank())
                .distinct()
                .toList();
        List<String> roleCodes = roles.stream().map(RoleEntity::getCode).toList();
        Instant now = Instant.now();
        String sessionId = UUID.randomUUID().toString();
        AuthSession session = AuthSession.builder()
                .sessionId(sessionId)
                .userId(user.getId())
                .username(user.getUsername())
                .permissions(permissions)
                .roleCodes(roleCodes)
                .loginTime(now)
                .lastActiveTime(now)
                .expiresAt(now.plusSeconds(60L * 30))
                .build();
        sessionStore.save(session, java.time.Duration.ofDays(7));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), sessionId, now);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername(), sessionId, now);

        auditService.saveLoginLog(user.getUsername(), clientIp(httpServletRequest), "SUCCESS", "登录成功");
        auditService.upsertOnlineUser(OnlineUserEntity.builder()
                .sessionId(sessionId)
                .userId(user.getId())
                .username(user.getUsername())
                .ip(clientIp(httpServletRequest))
                .userAgent(httpServletRequest.getHeader("User-Agent"))
                .loginTime(LocalDateTime.now())
                .lastActiveTime(LocalDateTime.now())
                .expiresAt(LocalDateTime.ofInstant(now.plus(java.time.Duration.ofDays(7)), ZoneOffset.UTC))
                .build());

        return new LoginResponse(accessToken, refreshToken, now.plusSeconds(60L * 30), toCurrentUser(user, roles, permissions), permissions);
    }

    public LoginResponse refresh(String refreshToken) {
        Claims claims = jwtTokenProvider.parseClaims(refreshToken);
        if (!"refresh".equals(claims.get("tokenType", String.class))) {
            throw new BizException("A0203", "刷新令牌无效");
        }
        String sessionId = claims.get("sessionId", String.class);
        AuthSession session = sessionStore.findBySessionId(sessionId)
                .orElseThrow(() -> new BizException("A0201", "登录状态已失效"));
        UserEntity user = systemLookupService.requireUserById(session.getUserId());
        Instant now = Instant.now();
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), sessionId, now);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername(), sessionId, now);
        session.setLastActiveTime(now);
        sessionStore.save(session, java.time.Duration.ofDays(7));
        return new LoginResponse(accessToken, newRefreshToken, now.plusSeconds(60L * 30),
                toCurrentUser(user, systemLookupService.getRolesByUserId(user.getId()), session.getPermissions()),
                session.getPermissions());
    }

    public CurrentUserView profile() {
        AuthSession session = SecurityUtils.currentPrincipal().session();
        UserEntity user = systemLookupService.requireUserById(session.getUserId());
        return toCurrentUser(user, systemLookupService.getRolesByUserId(user.getId()), session.getPermissions());
    }

    public void logout() {
        AuthSession session = SecurityUtils.currentPrincipal().session();
        sessionStore.delete(session.getSessionId());
        auditService.removeOnlineUser(session.getSessionId());
    }

    public void updatePassword(String oldPassword, String newPassword) {
        AuthSession session = SecurityUtils.currentPrincipal().session();
        UserEntity user = systemLookupService.requireUserById(session.getUserId());
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BizException("A0401", "旧密码错误");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
    }

    private CurrentUserView toCurrentUser(UserEntity user, List<RoleEntity> roles, List<String> permissions) {
        var dept = systemLookupService.getDept(user.getDeptId());
        String deptName = dept == null ? "" : dept.getName();
        List<String> roleCodes = roles.stream().map(RoleEntity::getCode).toList();
        return new CurrentUserView(user.getId(), user.getUsername(), user.getNickName(), user.getDeptId(), deptName,
                roleCodes, permissions, user.getDataScope());
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        return storedPassword != null && (storedPassword.equals(rawPassword) || passwordEncoder.matches(rawPassword, storedPassword));
    }
}
