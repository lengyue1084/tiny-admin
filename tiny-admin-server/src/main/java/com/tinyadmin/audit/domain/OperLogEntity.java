package com.tinyadmin.audit.domain;

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
@TableName("sys_oper_log")
public class OperLogEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String module;
    private String action;
    private String method;
    private String requestUri;
    private String operatorName;
    private String requestBody;
    private Integer success;
    private String errorMessage;
    private LocalDateTime createdAt;
}
