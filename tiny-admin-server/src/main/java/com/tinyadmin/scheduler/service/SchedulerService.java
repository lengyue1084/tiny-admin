package com.tinyadmin.scheduler.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.common.exception.BizException;
import com.tinyadmin.infra.quartz.MethodInvokingJob;
import com.tinyadmin.scheduler.domain.JobInfoEntity;
import com.tinyadmin.scheduler.domain.JobLogEntity;
import com.tinyadmin.scheduler.mapper.JobInfoMapper;
import com.tinyadmin.scheduler.mapper.JobLogMapper;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final JobInfoMapper jobInfoMapper;
    private final JobLogMapper jobLogMapper;
    private final Scheduler scheduler;

    @PostConstruct
    public void init() {
        jobInfoMapper.selectList(new LambdaQueryWrapper<JobInfoEntity>().eq(JobInfoEntity::getStatus, 1))
                .forEach(this::registerJobQuietly);
    }

    public List<JobInfoEntity> jobs() {
        return jobInfoMapper.selectList(new LambdaQueryWrapper<JobInfoEntity>().orderByDesc(JobInfoEntity::getId));
    }

    public List<JobLogEntity> logs() {
        return jobLogMapper.selectList(new LambdaQueryWrapper<JobLogEntity>().orderByDesc(JobLogEntity::getCreatedAt));
    }

    public JobInfoEntity save(JobInfoEntity entity) {
        if (entity.getId() == null) {
            jobInfoMapper.insert(entity);
        } else {
            unregisterJob(entity.getId());
            jobInfoMapper.updateById(entity);
        }
        if (entity.getStatus() != null && entity.getStatus() == 1) {
            registerJobQuietly(jobInfoMapper.selectById(entity.getId()));
        }
        return jobInfoMapper.selectById(entity.getId());
    }

    public void trigger(Long jobId) {
        JobInfoEntity entity = requireJob(jobId);
        try {
            scheduler.triggerJob(jobKey(jobId));
            logResult(entity, true, "手动执行成功");
        } catch (SchedulerException ex) {
            logResult(entity, false, ex.getMessage());
            throw new BizException("B2001", "任务执行失败");
        }
    }

    public void updateStatus(Long jobId, Integer status) {
        JobInfoEntity entity = requireJob(jobId);
        entity.setStatus(status);
        jobInfoMapper.updateById(entity);
        if (status == 1) {
            registerJobQuietly(entity);
        } else {
            unregisterJob(jobId);
        }
    }

    public void delete(Long jobId) {
        unregisterJob(jobId);
        jobInfoMapper.deleteById(jobId);
    }

    private JobInfoEntity requireJob(Long jobId) {
        JobInfoEntity entity = jobInfoMapper.selectById(jobId);
        if (entity == null) {
            throw new BizException("A0404", "任务不存在");
        }
        return entity;
    }

    private void registerJobQuietly(JobInfoEntity entity) {
        try {
            JobDetail jobDetail = JobBuilder.newJob(MethodInvokingJob.class)
                    .withIdentity(jobKey(entity.getId()))
                    .usingJobData(jobData(entity))
                    .build();
            var trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerKey(entity.getId()))
                    .forJob(jobDetail)
                    .withSchedule(CronScheduleBuilder.cronSchedule(entity.getCronExpression()))
                    .build();
            scheduler.scheduleJob(jobDetail, trigger);
        } catch (Exception ex) {
            logResult(entity, false, ex.getMessage());
            log.warn("Failed to register job {}", entity.getId(), ex);
        }
    }

    private void unregisterJob(Long jobId) {
        try {
            scheduler.deleteJob(jobKey(jobId));
        } catch (SchedulerException ignored) {
        }
    }

    private void logResult(JobInfoEntity entity, boolean success, String message) {
        jobLogMapper.insert(JobLogEntity.builder()
                .jobId(entity.getId())
                .jobName(entity.getName())
                .success(success ? 1 : 0)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private JobDataMap jobData(JobInfoEntity entity) {
        JobDataMap dataMap = new JobDataMap();
        dataMap.put("targetBean", entity.getTargetBean());
        dataMap.put("targetMethod", entity.getTargetMethod());
        dataMap.put("args", entity.getArgs());
        return dataMap;
    }

    private JobKey jobKey(Long jobId) {
        return JobKey.jobKey("job-" + jobId, "tiny-admin");
    }

    private TriggerKey triggerKey(Long jobId) {
        return TriggerKey.triggerKey("trigger-" + jobId, "tiny-admin");
    }
}
