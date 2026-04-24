package com.tinyadmin.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tiny-admin.cors")
public record CorsProperties(List<String> allowedOrigins) {
}
