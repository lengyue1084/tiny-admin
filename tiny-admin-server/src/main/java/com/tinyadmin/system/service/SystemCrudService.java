package com.tinyadmin.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyadmin.common.api.PageQuery;
import com.tinyadmin.common.api.PageResult;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SystemCrudService {

    public <T> PageResult<T> page(BaseMapper<T> mapper, LambdaQueryWrapper<T> queryWrapper, PageQuery pageQuery) {
        List<T> rows = mapper.selectList(queryWrapper.last("limit " + pageQuery.offset() + "," + pageQuery.pageSize()));
        long total = mapper.selectCount(queryWrapper);
        return new PageResult<>(rows, total);
    }
}
