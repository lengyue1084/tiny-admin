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

    public List<OperLogEntity> listOperLogs() {
        return operLogMapper.selectList(new LambdaQueryWrapper<OperLogEntity>().orderByDesc(OperLogEntity::getCreatedAt));
    }

    public List<LoginLogEntity> listLoginLogs() {
        return loginLogMapper.selectList(new LambdaQueryWrapper<LoginLogEntity>().orderByDesc(LoginLogEntity::getCreatedAt));
    }

    public List<OnlineUserEntity> listOnlineUsers() {
        return onlineUserMapper.selectList(new LambdaQueryWrapper<OnlineUserEntity>().orderByDesc(OnlineUserEntity::getLastActiveTime));
    }

    public void removeOnlineUser(String sessionId) {
        onlineUserMapper.delete(new LambdaQueryWrapper<OnlineUserEntity>().eq(OnlineUserEntity::getSessionId, sessionId));
    }
}
