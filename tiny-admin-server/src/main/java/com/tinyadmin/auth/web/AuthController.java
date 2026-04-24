package com.tinyadmin.auth.web;

import com.tinyadmin.auth.dto.CaptchaResponse;
import com.tinyadmin.auth.dto.LoginRequest;
import com.tinyadmin.auth.dto.LoginResponse;
import com.tinyadmin.auth.dto.RefreshTokenRequest;
import com.tinyadmin.auth.dto.UpdatePasswordRequest;
import com.tinyadmin.auth.service.AuthService;
import com.tinyadmin.auth.service.CaptchaService;
import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.web.RequestTraceContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CaptchaService captchaService;
    private final AuthService authService;

    @GetMapping("/captcha")
    public ApiResponse<CaptchaResponse> captcha() {
        return ApiResponse.success(captchaService.createCaptcha(), RequestTraceContext.get());
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return ApiResponse.success(authService.login(request, servletRequest), RequestTraceContext.get());
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request.refreshToken()), RequestTraceContext.get());
    }

    @GetMapping("/profile")
    public ApiResponse<?> profile() {
        return ApiResponse.success(authService.profile(), RequestTraceContext.get());
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        authService.logout();
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @PostMapping("/update-password")
    public ApiResponse<Void> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        authService.updatePassword(request.oldPassword(), request.newPassword());
        return ApiResponse.success(null, RequestTraceContext.get());
    }
}
