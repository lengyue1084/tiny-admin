package com.tinyadmin.infra.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tinyadmin.audit.domain.OperLogEntity;
import com.tinyadmin.audit.service.AuditService;
import com.tinyadmin.infra.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class OperLogAspect {

    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;

    @Pointcut("@annotation(com.tinyadmin.infra.audit.OperLog)")
    public void operLogPointcut() {
    }

    @AfterReturning("operLogPointcut()")
    public void afterReturning(JoinPoint joinPoint) {
        save(joinPoint, true, null);
    }

    @AfterThrowing(pointcut = "operLogPointcut()", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Throwable ex) {
        save(joinPoint, false, ex.getMessage());
    }

    private void save(JoinPoint joinPoint, boolean success, String errorMessage) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        OperLog operLog = signature.getMethod().getAnnotation(OperLog.class);
        String operator = "anonymous";
        try {
            operator = SecurityUtils.currentPrincipal().getUsername();
        } catch (Exception ignored) {
        }
        auditService.saveOperLog(OperLogEntity.builder()
                .module(operLog.module())
                .action(operLog.action())
                .method(signature.toShortString())
                .requestUri(request.getRequestURI())
                .operatorName(operator)
                .requestBody(writeArgs(joinPoint.getArgs()))
                .success(success ? 1 : 0)
                .errorMessage(errorMessage)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String writeArgs(Object[] args) {
        try {
            return objectMapper.writeValueAsString(Arrays.stream(args).limit(3).toList());
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }
}
