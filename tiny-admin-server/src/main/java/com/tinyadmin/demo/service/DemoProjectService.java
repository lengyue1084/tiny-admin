package com.tinyadmin.demo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.demo.domain.DemoProjectEntity;
import com.tinyadmin.demo.mapper.DemoProjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class DemoProjectService {

    private final DemoProjectMapper mapper;

    public List<DemoProjectEntity> list(String keyword, String status) {
        LambdaQueryWrapper<DemoProjectEntity> query = new LambdaQueryWrapper<DemoProjectEntity>()
                .orderByDesc(DemoProjectEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(DemoProjectEntity::getName, keyword)
                    .or()
                    .like(DemoProjectEntity::getOwner, keyword)
                    .or()
                    .like(DemoProjectEntity::getDescription, keyword));
        }
        if (StringUtils.hasText(status)) {
            query.eq(DemoProjectEntity::getStatus, status);
        }
        return mapper.selectList(query);
    }

    public DemoProjectEntity save(DemoProjectEntity entity) {
        if (entity.getId() == null) {
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            mapper.insert(entity);
        } else {
            entity.setUpdatedAt(LocalDateTime.now());
            mapper.updateById(entity);
        }
        return mapper.selectById(entity.getId());
    }

    public void delete(Long id) {
        mapper.deleteById(id);
    }
}
