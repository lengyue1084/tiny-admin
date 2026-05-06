package com.tinyadmin.monitor.web;

import com.tinyadmin.audit.service.AuditService;
import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.web.RequestTraceContext;
import com.tinyadmin.infra.store.SessionStore;
import com.tinyadmin.monitor.service.MonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/monitor")
@RequiredArgsConstructor
public class MonitorController {

    private final MonitorService monitorService;
    private final AuditService auditService;
    private final SessionStore sessionStore;

    @GetMapping("/server")
    @PreAuthorize("hasAuthority('monitor:server:view')")
    public ApiResponse<?> server() {
        return ApiResponse.success(monitorService.serverInfo(), RequestTraceContext.get());
    }

    @GetMapping("/cache")
    @PreAuthorize("hasAuthority('monitor:cache:view')")
    public ApiResponse<?> cache() {
        return ApiResponse.success(monitorService.cacheInfo(), RequestTraceContext.get());
    }

    @GetMapping("/online-users")
    @PreAuthorize("hasAuthority('monitor:online:list')")
    public ApiResponse<?> onlineUsers(@RequestParam(required = false) String keyword) {
        var rows = auditService.listOnlineUsers(keyword);
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @DeleteMapping("/online-users/{sessionId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> forceLogout(@PathVariable String sessionId) {
        sessionStore.delete(sessionId);
        auditService.removeOnlineUser(sessionId);
        return ApiResponse.success(null, RequestTraceContext.get());
    }
}
