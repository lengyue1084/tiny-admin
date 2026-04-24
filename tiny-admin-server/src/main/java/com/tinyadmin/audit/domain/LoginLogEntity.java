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
@TableName("sys_login_log")
public class LoginLogEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String ip;
    private String status;
    private String message;
    private LocalDateTime createdAt;
}
