package com.tinyadmin.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.common.exception.BizException;
import com.tinyadmin.system.domain.DeptEntity;
import com.tinyadmin.system.domain.MenuEntity;
import com.tinyadmin.system.domain.PostEntity;
import com.tinyadmin.system.domain.RoleEntity;
import com.tinyadmin.system.domain.RoleMenuEntity;
import com.tinyadmin.system.domain.UserEntity;
import com.tinyadmin.system.domain.UserRoleEntity;
import com.tinyadmin.system.mapper.DeptMapper;
import com.tinyadmin.system.mapper.MenuMapper;
import com.tinyadmin.system.mapper.PostMapper;
import com.tinyadmin.system.mapper.RoleMapper;
import com.tinyadmin.system.mapper.RoleMenuMapper;
import com.tinyadmin.system.mapper.UserMapper;
import com.tinyadmin.system.mapper.UserRoleMapper;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemLookupService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final MenuMapper menuMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMenuMapper roleMenuMapper;
    private final DeptMapper deptMapper;
    private final PostMapper postMapper;

    public UserEntity requireUserByUsername(String username) {
        return userMapper.selectOne(new LambdaQueryWrapper<UserEntity>().eq(UserEntity::getUsername, username));
    }

    public UserEntity requireUserById(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException("A0404", "用户不存在");
        }
        return user;
    }

    public List<RoleEntity> getRolesByUserId(Long userId) {
        List<Long> roleIds = getRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return Collections.emptyList();
        }
        return roleMapper.selectBatchIds(roleIds);
    }

    public List<Long> getRoleIdsByUserId(Long userId) {
        return userRoleMapper.selectList(new LambdaQueryWrapper<UserRoleEntity>()
                        .eq(UserRoleEntity::getUserId, userId))
                .stream()
                .map(UserRoleEntity::getRoleId)
                .toList();
    }

    public List<MenuEntity> getMenusByUserId(Long userId) {
        List<Long> roleIds = getRolesByUserId(userId).stream().map(RoleEntity::getId).toList();
        if (roleIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> menuIds = roleMenuMapper.selectList(new LambdaQueryWrapper<RoleMenuEntity>()
                        .in(RoleMenuEntity::getRoleId, roleIds))
                .stream()
                .map(RoleMenuEntity::getMenuId)
                .distinct()
                .toList();
        return menuIds.isEmpty() ? Collections.emptyList() : menuMapper.selectBatchIds(menuIds);
    }

    public List<Long> getMenuIdsByRoleId(Long roleId) {
        return roleMenuMapper.selectList(new LambdaQueryWrapper<RoleMenuEntity>()
                        .eq(RoleMenuEntity::getRoleId, roleId))
                .stream()
                .map(RoleMenuEntity::getMenuId)
                .distinct()
                .toList();
    }

    public DeptEntity getDept(Long deptId) {
        return deptId == null ? null : deptMapper.selectById(deptId);
    }

    public PostEntity getPost(Long postId) {
        return postId == null ? null : postMapper.selectById(postId);
    }

    public List<DeptEntity> listDepts() {
        return deptMapper.selectList(new LambdaQueryWrapper<DeptEntity>().orderByAsc(DeptEntity::getOrderNum).orderByAsc(DeptEntity::getId));
    }

    public List<MenuEntity> listMenus() {
        return menuMapper.selectList(new LambdaQueryWrapper<MenuEntity>().orderByAsc(MenuEntity::getOrderNum).orderByAsc(MenuEntity::getId));
    }

    public List<RoleEntity> listRoles() {
        return roleMapper.selectList(new LambdaQueryWrapper<RoleEntity>().orderByAsc(RoleEntity::getId));
    }

    public List<PostEntity> listPosts() {
        return postMapper.selectList(new LambdaQueryWrapper<PostEntity>().orderByAsc(PostEntity::getOrderNum).orderByAsc(PostEntity::getId));
    }

    public boolean wouldCreateMenuCycle(Long menuId, Long parentId) {
        if (menuId == null || parentId == null || parentId <= 0) {
            return false;
        }
        Long currentParentId = parentId;
        while (currentParentId != null && currentParentId > 0) {
            if (menuId.equals(currentParentId)) {
                return true;
            }
            MenuEntity parent = menuMapper.selectById(currentParentId);
            if (parent == null) {
                return false;
            }
            currentParentId = parent.getParentId();
        }
        return false;
    }

    public boolean wouldCreateDeptCycle(Long deptId, Long parentId) {
        if (deptId == null || parentId == null || parentId <= 0) {
            return false;
        }
        Long currentParentId = parentId;
        while (currentParentId != null && currentParentId > 0) {
            if (deptId.equals(currentParentId)) {
                return true;
            }
            DeptEntity parent = deptMapper.selectById(currentParentId);
            if (parent == null) {
                return false;
            }
            currentParentId = parent.getParentId();
        }
        return false;
    }
}
