package com.tinyadmin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tiny-admin.file")
public record FileStorageProperties(String storagePath) {
}
