package com.tinyadmin.common.api;

public record PageQuery(
        long pageNum,
        long pageSize,
        String sortField,
        String sortOrder
) {

    public long offset() {
        return Math.max(0, (pageNum - 1) * pageSize);
    }

    public static PageQuery defaulted(Long pageNum, Long pageSize, String sortField, String sortOrder) {
        return new PageQuery(pageNum == null || pageNum < 1 ? 1 : pageNum,
                pageSize == null || pageSize < 1 ? 10 : Math.min(pageSize, 200),
                sortField,
                sortOrder);
    }
}
