package com.tinyadmin.infra.store;

import com.tinyadmin.infra.security.AuthSession;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

public interface SessionStore {
    void save(AuthSession session, Duration ttl);

    Optional<AuthSession> findBySessionId(String sessionId);

    void delete(String sessionId);

    List<String> keys(String prefix);
}
