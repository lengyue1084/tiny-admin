package com.tinyadmin.system.dto;

import java.util.ArrayList;
import java.util.List;

public record MenuNodeView(
        Long id,
        Long parentId,
        String name,
        String path,
        String component,
        String icon,
        String type,
        String permission,
        Integer orderNum,
        List<MenuNodeView> children
) {
    public MenuNodeView withChildren(List<MenuNodeView> children) {
        return new MenuNodeView(id, parentId, name, path, component, icon, type, permission, orderNum,
                children == null ? new ArrayList<>() : children);
    }
}
