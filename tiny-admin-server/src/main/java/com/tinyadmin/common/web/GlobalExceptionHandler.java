package com.tinyadmin.common.web;

import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.exception.BizException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public ApiResponse<Void> handleBiz(BizException ex) {
        return ApiResponse.failure(ex.getCode(), ex.getMessage(), RequestTraceContext.get());
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class,
            BindException.class,
            HttpMessageNotReadableException.class
    })
    public ApiResponse<Void> handleBadRequest(Exception ex) {
        return ApiResponse.failure("A0400", "请求参数不合法", RequestTraceContext.get());
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ApiResponse.failure("B0001", "服务异常，请稍后重试", RequestTraceContext.get());
    }
}
