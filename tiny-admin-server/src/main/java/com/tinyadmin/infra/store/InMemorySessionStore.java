package com.tinyadmin.infra.store;

import com.tinyadmin.infra.security.AuthSession;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemorySessionStore implements SessionStore {

    private final Map<String, Holder<AuthSession>> cache = new ConcurrentHashMap<>();

    @Override
    public void save(AuthSession session, Duration ttl) {
        cache.put(session.getSessionId(), new Holder<>(session, Instant.now().plus(ttl)));
    }

    @Override
    public Optional<AuthSession> findBySessionId(String sessionId) {
        Holder<AuthSession> holder = cache.get(sessionId);
        if (holder == null || holder.isExpired()) {
            cache.remove(sessionId);
            return Optional.empty();
        }
        return Optional.of(holder.value());
    }

    @Override
    public void delete(String sessionId) {
        cache.remove(sessionId);
    }

    @Override
    public List<String> keys(String prefix) {
        return cache.keySet().stream().filter(key -> key.startsWith(prefix)).toList();
    }

    private record Holder<T>(T value, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}
