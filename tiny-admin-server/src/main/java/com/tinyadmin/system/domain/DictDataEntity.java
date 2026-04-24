package com.tinyadmin.system.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
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
@TableName("sys_dict_data")
public class DictDataEntity extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long typeId;
    private String label;
    @TableField("dict_value")
    private String value;
    private String tagType;
    private Integer orderNum;
    private Integer status;
}
