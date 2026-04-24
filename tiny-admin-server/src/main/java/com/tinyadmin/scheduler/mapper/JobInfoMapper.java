package com.tinyadmin.scheduler.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.scheduler.domain.JobInfoEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobInfoMapper extends BaseMapper<JobInfoEntity> {
}
