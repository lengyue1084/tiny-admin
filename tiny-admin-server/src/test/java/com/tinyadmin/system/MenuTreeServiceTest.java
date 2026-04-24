package com.tinyadmin.system;

import static org.assertj.core.api.Assertions.assertThat;

import com.tinyadmin.system.domain.MenuEntity;
import com.tinyadmin.system.service.MenuTreeBuilder;
import java.util.List;
import org.junit.jupiter.api.Test;

class MenuTreeServiceTest {

    @Test
    void shouldBuildOrderedTreeFromFlatMenus() {
        List<MenuEntity> menus = List.of(
                MenuEntity.builder().id(10L).parentId(0L).name("系统管理").orderNum(2).build(),
                MenuEntity.builder().id(11L).parentId(10L).name("用户管理").orderNum(2).build(),
                MenuEntity.builder().id(12L).parentId(10L).name("角色管理").orderNum(1).build(),
                MenuEntity.builder().id(20L).parentId(0L).name("监控运维").orderNum(1).build()
        );

        List<MenuTreeBuilder.MenuNode> tree = MenuTreeBuilder.build(menus);

        assertThat(tree).hasSize(2);
        assertThat(tree.get(0).name()).isEqualTo("监控运维");
        assertThat(tree.get(1).children()).extracting(MenuTreeBuilder.MenuNode::name)
                .containsExactly("角色管理", "用户管理");
    }
}
