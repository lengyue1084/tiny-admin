package com.tinyadmin.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        String code,
        String message,
        T data,
        Long total,
        String traceId
) {

    public static <T> ApiResponse<T> success(T data, String traceId) {
        return new ApiResponse<>("00000", "success", data, null, traceId);
    }

    public static <T> ApiResponse<T> success(T data, Long total, String traceId) {
        return new ApiResponse<>("00000", "success", data, total, traceId);
    }

    public static <T> ApiResponse<T> failure(String code, String message, String traceId) {
        return new ApiResponse<>(code, message, null, null, traceId);
    }
}
