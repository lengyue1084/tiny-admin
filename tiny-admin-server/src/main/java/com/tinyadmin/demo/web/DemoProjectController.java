package com.tinyadmin.demo.web;

import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.web.RequestTraceContext;
import com.tinyadmin.demo.domain.DemoProjectEntity;
import com.tinyadmin.demo.service.DemoProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo/projects")
@RequiredArgsConstructor
public class DemoProjectController {

    private final DemoProjectService service;

    @GetMapping
    public ApiResponse<?> list() {
        var rows = service.list();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping
    public ApiResponse<DemoProjectEntity> save(@RequestBody DemoProjectEntity entity) {
        return ApiResponse.success(service.save(entity), RequestTraceContext.get());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }
}
