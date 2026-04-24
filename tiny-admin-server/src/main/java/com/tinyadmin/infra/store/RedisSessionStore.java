package com.tinyadmin.infra.store;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tinyadmin.common.exception.BizException;
import com.tinyadmin.infra.security.AuthSession;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class RedisSessionStore implements SessionStore {

    private static final String PREFIX = "tiny-admin:session:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void save(AuthSession session, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(PREFIX + session.getSessionId(), objectMapper.writeValueAsString(session), ttl);
        } catch (JsonProcessingException ex) {
            throw new BizException("B0002", "会话保存失败");
        }
    }

    @Override
    public Optional<AuthSession> findBySessionId(String sessionId) {
        String value = redisTemplate.opsForValue().get(PREFIX + sessionId);
        if (value == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(value, AuthSession.class));
        } catch (JsonProcessingException ex) {
            throw new BizException("B0002", "会话解析失败");
        }
    }

    @Override
    public void delete(String sessionId) {
        redisTemplate.delete(PREFIX + sessionId);
    }

    @Override
    public List<String> keys(String prefix) {
        return redisTemplate.keys(prefix + "*").stream().toList();
    }
}
