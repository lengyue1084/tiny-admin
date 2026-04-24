package com.tinyadmin.scheduler.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("job_log")
public class JobLogEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long jobId;
    private String jobName;
    private Integer success;
    private String message;
    private LocalDateTime createdAt;
}
