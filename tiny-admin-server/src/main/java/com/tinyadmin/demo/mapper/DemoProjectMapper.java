package com.tinyadmin.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.demo.domain.DemoProjectEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DemoProjectMapper extends BaseMapper<DemoProjectEntity> {
}
