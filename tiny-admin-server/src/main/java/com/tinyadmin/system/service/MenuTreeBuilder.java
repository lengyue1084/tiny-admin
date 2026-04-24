package com.tinyadmin.system.service;

import com.tinyadmin.system.domain.MenuEntity;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class MenuTreeBuilder {

    private MenuTreeBuilder() {
    }

    public static List<MenuNode> build(List<MenuEntity> menus) {
        Map<Long, MenuNode> map = new HashMap<>();
        menus.forEach(menu -> map.put(menu.getId(), new MenuNode(
                menu.getId(),
                menu.getParentId(),
                menu.getName(),
                menu.getPath(),
                menu.getComponent(),
                menu.getIcon(),
                menu.getType(),
                menu.getPermissionCode(),
                menu.getOrderNum(),
                new ArrayList<>()
        )));
        List<MenuNode> roots = new ArrayList<>();
        map.values().stream()
                .sorted(Comparator.comparing(MenuNode::orderNum).thenComparing(MenuNode::id))
                .forEach(node -> {
                    if (node.parentId() == null || node.parentId() == 0 || !map.containsKey(node.parentId())) {
                        roots.add(node);
                    } else {
                        map.get(node.parentId()).children().add(node);
                    }
                });
        roots.forEach(MenuTreeBuilder::sortNode);
        return roots;
    }

    private static void sortNode(MenuNode node) {
        node.children().sort(Comparator.comparing(MenuNode::orderNum).thenComparing(MenuNode::id));
        node.children().forEach(MenuTreeBuilder::sortNode);
    }

    public record MenuNode(
            Long id,
            Long parentId,
            String name,
            String path,
            String component,
            String icon,
            String type,
            String permission,
            Integer orderNum,
            List<MenuNode> children
    ) {
    }
}
