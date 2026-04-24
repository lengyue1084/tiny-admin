package com.tinyadmin.audit.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.audit.domain.OnlineUserEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OnlineUserMapper extends BaseMapper<OnlineUserEntity> {
}
