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
@TableName("sys_online_user")
public class OnlineUserEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String sessionId;
    private Long userId;
    private String username;
    private String ip;
    private String userAgent;
    private LocalDateTime loginTime;
    private LocalDateTime lastActiveTime;
    private LocalDateTime expiresAt;
}
