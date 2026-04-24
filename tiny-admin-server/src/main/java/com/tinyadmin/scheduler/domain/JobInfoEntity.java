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
@TableName("job_info")
public class JobInfoEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String jobGroup;
    private String cronExpression;
    private String targetBean;
    private String targetMethod;
    private String args;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
