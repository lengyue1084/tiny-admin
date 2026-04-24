package com.tinyadmin.infra.store;

import java.time.Duration;
import java.util.Optional;

public interface CaptchaStore {
    void save(String key, String value, Duration ttl);

    Optional<String> get(String key);

    void delete(String key);
}
