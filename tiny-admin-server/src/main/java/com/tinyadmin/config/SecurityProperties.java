package com.tinyadmin.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tiny-admin.security")
public record SecurityProperties(
        String issuer,
        Duration accessTokenTtl,
        Duration refreshTokenTtl,
        String secret
) {
}
