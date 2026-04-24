package com.tinyadmin.audit.web;

import com.tinyadmin.audit.service.AuditService;
import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.web.RequestTraceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/oper-logs")
    public ApiResponse<?> operLogs() {
        var rows = auditService.listOperLogs();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @GetMapping("/login-logs")
    public ApiResponse<?> loginLogs() {
        var rows = auditService.listLoginLogs();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }
}
