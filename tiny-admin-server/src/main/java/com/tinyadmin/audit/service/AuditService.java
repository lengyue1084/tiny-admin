package com.tinyadmin.audit.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.audit.domain.LoginLogEntity;
import com.tinyadmin.audit.domain.OnlineUserEntity;
import com.tinyadmin.audit.domain.OperLogEntity;
import com.tinyadmin.audit.mapper.LoginLogMapper;
import com.tinyadmin.audit.mapper.OnlineUserMapper;
import com.tinyadmin.audit.mapper.OperLogMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final OperLogMapper operLogMapper;
    private final LoginLogMapper loginLogMapper;
    private final OnlineUserMapper onlineUserMapper;

    public void saveOperLog(OperLogEntity entity) {
        operLogMapper.insert(entity);
    }

    public void saveLoginLog(String username, String ip, String status, String message) {
        loginLogMapper.insert(LoginLogEntity.builder()
                .username(username)
                .ip(ip)
                .status(status)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public void upsertOnlineUser(OnlineUserEntity entity) {
        OnlineUserEntity existing = onlineUserMapper.selectOne(new LambdaQueryWrapper<OnlineUserEntity>()
                .eq(OnlineUserEntity::getSessionId, entity.getSessionId()));
        if (existing == null) {
            onlineUserMapper.insert(entity);
            return;
        }
        entity.setId(existing.getId());
        onlineUserMapper.updateById(entity);
    }

    public List<OperLogEntity> listOperLogs(String keyword, Integer success) {
        LambdaQueryWrapper<OperLogEntity> query = new LambdaQueryWrapper<OperLogEntity>()
                .orderByDesc(OperLogEntity::getCreatedAt);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(OperLogEntity::getModule, keyword)
                    .or()
                    .like(OperLogEntity::getAction, keyword)
                    .or()
                    .like(OperLogEntity::getOperatorName, keyword)
                    .or()
                    .like(OperLogEntity::getRequestUri, keyword));
        }
        if (success != null) {
            query.eq(OperLogEntity::getSuccess, success);
        }
        return operLogMapper.selectList(query);
    }

    public List<LoginLogEntity> listLoginLogs(String keyword, String status) {
        LambdaQueryWrapper<LoginLogEntity> query = new LambdaQueryWrapper<LoginLogEntity>()
                .orderByDesc(LoginLogEntity::getCreatedAt);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(LoginLogEntity::getUsername, keyword)
                    .or()
                    .like(LoginLogEntity::getIp, keyword)
                    .or()
                    .like(LoginLogEntity::getMessage, keyword));
        }
        if (StringUtils.hasText(status)) {
            query.eq(LoginLogEntity::getStatus, status);
        }
        return loginLogMapper.selectList(query);
    }

    public List<OnlineUserEntity> listOnlineUsers(String keyword) {
        LambdaQueryWrapper<OnlineUserEntity> query = new LambdaQueryWrapper<OnlineUserEntity>()
                .orderByDesc(OnlineUserEntity::getLastActiveTime);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(OnlineUserEntity::getUsername, keyword)
                    .or()
                    .like(OnlineUserEntity::getIp, keyword)
                    .or()
                    .like(OnlineUserEntity::getSessionId, keyword));
        }
        return onlineUserMapper.selectList(query);
    }

    public void removeOnlineUser(String sessionId) {
        onlineUserMapper.delete(new LambdaQueryWrapper<OnlineUserEntity>().eq(OnlineUserEntity::getSessionId, sessionId));
    }
}
