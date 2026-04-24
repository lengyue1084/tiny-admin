package com.tinyadmin.infra.store;

import java.time.Duration;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class RedisCaptchaStore implements CaptchaStore {

    private static final String PREFIX = "tiny-admin:captcha:";

    private final StringRedisTemplate redisTemplate;

    @Override
    public void save(String key, String value, Duration ttl) {
        redisTemplate.opsForValue().set(PREFIX + key, value, ttl);
    }

    @Override
    public Optional<String> get(String key) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(PREFIX + key));
    }

    @Override
    public void delete(String key) {
        redisTemplate.delete(PREFIX + key);
    }
}
