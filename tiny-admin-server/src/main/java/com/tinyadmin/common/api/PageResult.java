package com.tinyadmin.common.api;

import java.util.List;

public record PageResult<T>(
        List<T> rows,
        long total
) {
}
