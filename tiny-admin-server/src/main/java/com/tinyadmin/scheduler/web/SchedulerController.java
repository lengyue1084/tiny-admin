package com.tinyadmin.scheduler.web;

import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.web.RequestTraceContext;
import com.tinyadmin.scheduler.domain.JobInfoEntity;
import com.tinyadmin.scheduler.service.SchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {

    private final SchedulerService schedulerService;

    @GetMapping("/jobs")
    public ApiResponse<?> jobs() {
        var rows = schedulerService.jobs();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @GetMapping("/job-logs")
    public ApiResponse<?> logs() {
        var rows = schedulerService.logs();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/jobs")
    public ApiResponse<JobInfoEntity> save(@RequestBody JobInfoEntity entity) {
        return ApiResponse.success(schedulerService.save(entity), RequestTraceContext.get());
    }

    @PostMapping("/jobs/{jobId}/trigger")
    public ApiResponse<Void> trigger(@PathVariable Long jobId) {
        schedulerService.trigger(jobId);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @PostMapping("/jobs/{jobId}/status/{status}")
    public ApiResponse<Void> status(@PathVariable Long jobId, @PathVariable Integer status) {
        schedulerService.updateStatus(jobId, status);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @DeleteMapping("/jobs/{jobId}")
    public ApiResponse<Void> delete(@PathVariable Long jobId) {
        schedulerService.delete(jobId);
        return ApiResponse.success(null, RequestTraceContext.get());
    }
}
