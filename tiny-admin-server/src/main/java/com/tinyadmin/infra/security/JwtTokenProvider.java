package com.tinyadmin.infra.security;

import com.tinyadmin.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final SecurityProperties securityProperties;
    private final SecretKey secretKey;

    public JwtTokenProvider(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
        byte[] secretBytes = securityProperties.secret().matches("^[A-Za-z0-9+/=]+$")
                ? Decoders.BASE64.decode(securityProperties.secret())
                : securityProperties.secret().getBytes(StandardCharsets.UTF_8);
        this.secretKey = Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateAccessToken(Long userId, String username, String sessionId, Instant now) {
        return buildToken(userId, username, sessionId, now, securityProperties.accessTokenTtl(), "access");
    }

    public String generateRefreshToken(Long userId, String username, String sessionId, Instant now) {
        return buildToken(userId, username, sessionId, now, securityProperties.refreshTokenTtl(), "refresh");
    }

    private String buildToken(Long userId, String username, String sessionId, Instant now, java.time.Duration ttl, String type) {
        return Jwts.builder()
                .issuer(securityProperties.issuer())
                .subject(String.valueOf(userId))
                .claims(Map.of("username", username, "sessionId", sessionId, "tokenType", type))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(secretKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
