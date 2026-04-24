package com.tinyadmin.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.system.domain.PostEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PostMapper extends BaseMapper<PostEntity> {
}
