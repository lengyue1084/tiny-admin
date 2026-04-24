package com.tinyadmin.infra.store;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemoryCaptchaStore implements CaptchaStore {

    private final Map<String, Holder<String>> cache = new ConcurrentHashMap<>();

    @Override
    public void save(String key, String value, Duration ttl) {
        cache.put(key, new Holder<>(value, Instant.now().plus(ttl)));
    }

    @Override
    public Optional<String> get(String key) {
        Holder<String> holder = cache.get(key);
        if (holder == null || holder.isExpired()) {
            cache.remove(key);
            return Optional.empty();
        }
        return Optional.of(holder.value());
    }

    @Override
    public void delete(String key) {
        cache.remove(key);
    }

    private record Holder<T>(T value, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}
