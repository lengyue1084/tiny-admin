package com.tinyadmin.monitor.service;

import com.tinyadmin.audit.service.AuditService;
import com.tinyadmin.infra.store.SessionStore;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MonitorService {

    private final SessionStore sessionStore;
    private final AuditService auditService;
    private final RedisConnectionFactory redisConnectionFactory;

    public Map<String, Object> serverInfo() {
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> result = new HashMap<>();
        result.put("jvm", Map.of(
                "uptime", ManagementFactory.getRuntimeMXBean().getUptime(),
                "processors", runtime.availableProcessors(),
                "heapUsed", runtime.totalMemory() - runtime.freeMemory(),
                "heapMax", runtime.maxMemory()
        ));
        File root = File.listRoots()[0];
        result.put("disk", Map.of(
                "total", root.getTotalSpace(),
                "free", root.getFreeSpace(),
                "usable", root.getUsableSpace()
        ));
        result.put("onlineUsers", auditService.listOnlineUsers(null).size());
        return result;
    }

    public Map<String, Object> cacheInfo() {
        long dbSize = 0;
        String redisVersion = "unknown";
        try (var connection = redisConnectionFactory.getConnection()) {
            dbSize = connection.serverCommands().dbSize();
            PropertiesParser parser = new PropertiesParser(connection.serverCommands().info());
            redisVersion = parser.get("redis_version", "unknown");
        } catch (Exception ignored) {
        }
        return Map.of(
                "sessionKeys", sessionStore.keys("tiny-admin:session:").size(),
                "onlineUsers", auditService.listOnlineUsers(null).size(),
                "redisDbSize", dbSize,
                "redisVersion", redisVersion
        );
    }

    private static final class PropertiesParser {
        private final Map<String, String> values = new HashMap<>();

        private PropertiesParser(java.util.Properties properties) {
            if (properties != null) {
                properties.forEach((key, value) -> values.put(String.valueOf(key), String.valueOf(value)));
            }
        }

        private String get(String key, String fallback) {
            return values.getOrDefault(key, fallback);
        }
    }
}
