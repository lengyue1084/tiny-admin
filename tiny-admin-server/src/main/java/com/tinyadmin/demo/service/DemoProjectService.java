package com.tinyadmin.demo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.demo.domain.DemoProjectEntity;
import com.tinyadmin.demo.mapper.DemoProjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DemoProjectService {

    private final DemoProjectMapper mapper;

    public List<DemoProjectEntity> list() {
        return mapper.selectList(new LambdaQueryWrapper<DemoProjectEntity>().orderByDesc(DemoProjectEntity::getId));
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
