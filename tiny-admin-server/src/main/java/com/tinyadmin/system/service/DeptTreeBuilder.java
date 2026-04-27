package com.tinyadmin.system.service;

import com.tinyadmin.system.domain.DeptEntity;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class DeptTreeBuilder {

    private DeptTreeBuilder() {
    }

    public static List<DeptNode> build(List<DeptEntity> depts) {
        Map<Long, DeptNode> nodeMap = new HashMap<>();
        depts.forEach(dept -> nodeMap.put(dept.getId(), new DeptNode(
                dept.getId(),
                dept.getParentId(),
                dept.getName(),
                dept.getOrderNum(),
                dept.getLeader(),
                dept.getPhone(),
                dept.getEmail(),
                dept.getStatus(),
                new ArrayList<>()
        )));

        List<DeptNode> roots = new ArrayList<>();
        nodeMap.values().stream()
                .sorted(Comparator.comparing(DeptNode::orderNum).thenComparing(DeptNode::id))
                .forEach(node -> {
                    if (node.parentId() == null || node.parentId() == 0 || !nodeMap.containsKey(node.parentId())) {
                        roots.add(node);
                    } else {
                        nodeMap.get(node.parentId()).children().add(node);
                    }
                });
        roots.forEach(DeptTreeBuilder::sortChildren);
        return roots;
    }

    private static void sortChildren(DeptNode node) {
        node.children().sort(Comparator.comparing(DeptNode::orderNum).thenComparing(DeptNode::id));
        node.children().forEach(DeptTreeBuilder::sortChildren);
    }

    public record DeptNode(
            Long id,
            Long parentId,
            String name,
            Integer orderNum,
            String leader,
            String phone,
            String email,
            Integer status,
            List<DeptNode> children
    ) {
    }
}
