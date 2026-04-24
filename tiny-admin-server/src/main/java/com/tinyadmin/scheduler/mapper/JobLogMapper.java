package com.tinyadmin.scheduler.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.scheduler.domain.JobLogEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobLogMapper extends BaseMapper<JobLogEntity> {
}
