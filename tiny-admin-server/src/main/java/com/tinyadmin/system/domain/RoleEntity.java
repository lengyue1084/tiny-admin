package com.tinyadmin.system.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("sys_role")
public class RoleEntity extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String code;
    private String dataScope;
    private Integer status;
    private String remark;
}
