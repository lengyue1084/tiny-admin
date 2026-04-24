package com.tinyadmin.auth.dto;

public record CaptchaResponse(
        String captchaKey,
        String captchaImage,
        String captchaText
) {
}
