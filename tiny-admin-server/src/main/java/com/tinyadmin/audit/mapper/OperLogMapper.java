package com.tinyadmin.audit.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.audit.domain.OperLogEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperLogMapper extends BaseMapper<OperLogEntity> {
}
