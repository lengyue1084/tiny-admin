package com.tinyadmin.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        CorsProperties.class,
        SecurityProperties.class,
        FileStorageProperties.class
})
public class TinyAdminProperties {
}
