package com.tinyadmin.system.web;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.common.exception.BizException;
import com.tinyadmin.common.web.RequestTraceContext;
import com.tinyadmin.infra.audit.OperLog;
import com.tinyadmin.system.domain.ConfigEntity;
import com.tinyadmin.system.domain.DeptEntity;
import com.tinyadmin.system.domain.DictDataEntity;
import com.tinyadmin.system.domain.DictTypeEntity;
import com.tinyadmin.system.domain.MenuEntity;
import com.tinyadmin.system.domain.NoticeEntity;
import com.tinyadmin.system.domain.PostEntity;
import com.tinyadmin.system.domain.RoleEntity;
import com.tinyadmin.system.domain.RoleMenuEntity;
import com.tinyadmin.system.domain.UserEntity;
import com.tinyadmin.system.domain.UserRoleEntity;
import com.tinyadmin.system.mapper.ConfigMapper;
import com.tinyadmin.system.mapper.DeptMapper;
import com.tinyadmin.system.mapper.DictDataMapper;
import com.tinyadmin.system.mapper.DictTypeMapper;
import com.tinyadmin.system.mapper.MenuMapper;
import com.tinyadmin.system.mapper.NoticeMapper;
import com.tinyadmin.system.mapper.PostMapper;
import com.tinyadmin.system.mapper.RoleMapper;
import com.tinyadmin.system.mapper.RoleMenuMapper;
import com.tinyadmin.system.mapper.UserMapper;
import com.tinyadmin.system.mapper.UserRoleMapper;
import com.tinyadmin.system.service.DeptTreeBuilder;
import com.tinyadmin.system.service.MenuTreeBuilder;
import com.tinyadmin.system.service.SystemLookupService;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final MenuMapper menuMapper;
    private final DeptMapper deptMapper;
    private final PostMapper postMapper;
    private final DictTypeMapper dictTypeMapper;
    private final DictDataMapper dictDataMapper;
    private final ConfigMapper configMapper;
    private final NoticeMapper noticeMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMenuMapper roleMenuMapper;
    private final SystemLookupService lookupService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/menus/current")
    public ApiResponse<?> currentMenus() {
        Long userId = com.tinyadmin.infra.security.SecurityUtils.currentPrincipal().session().getUserId();
        return ApiResponse.success(MenuTreeBuilder.build(lookupService.getMenusByUserId(userId)), RequestTraceContext.get());
    }

    @GetMapping("/meta")
    public ApiResponse<SystemMetaView> meta() {
        List<DeptEntity> deptOptions = lookupService.listDepts();
        List<MenuEntity> menuOptions = lookupService.listMenus();
        SystemMetaView view = new SystemMetaView(
                lookupService.listRoles().stream().map(role -> new RoleOption(role.getId(), role.getName(), role.getCode())).toList(),
                lookupService.listPosts().stream().map(post -> new PostOption(post.getId(), post.getName(), post.getCode())).toList(),
                deptOptions,
                DeptTreeBuilder.build(deptOptions),
                menuOptions,
                MenuTreeBuilder.build(menuOptions)
        );
        return ApiResponse.success(view, RequestTraceContext.get());
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('system:user:list')")
    public ApiResponse<List<UserView>> users() {
        List<UserView> rows = userMapper.selectList(new LambdaQueryWrapper<UserEntity>().orderByAsc(UserEntity::getId))
                .stream()
                .map(user -> {
                    DeptEntity dept = lookupService.getDept(user.getDeptId());
                    PostEntity post = lookupService.getPost(user.getPostId());
                    return new UserView(
                            user.getId(),
                            user.getUsername(),
                            user.getNickName(),
                            user.getEmail(),
                            user.getPhone(),
                            user.getDeptId(),
                            dept == null ? "" : dept.getName(),
                            user.getPostId(),
                            post == null ? "" : post.getName(),
                            user.getStatus(),
                            user.getDataScope(),
                            lookupService.getRoleIdsByUserId(user.getId())
                    );
                })
                .toList();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/users")
    @OperLog(module = "系统管理", action = "保存用户")
    @PreAuthorize("hasAuthority('system:user:save')")
    public ApiResponse<UserEntity> saveUser(@RequestBody UserPayload payload) {
        UserEntity entity = payload.toUser();
        entity.setPassword(payload.id() == null
                ? passwordEncoder.encode(payload.password() == null ? "admin123" : payload.password())
                : entity.getPassword());
        if (entity.getId() == null) {
            userMapper.insert(entity);
        } else {
            UserEntity existing = userMapper.selectById(entity.getId());
            if (payload.password() == null || payload.password().isBlank()) {
                entity.setPassword(existing.getPassword());
            } else {
                entity.setPassword(passwordEncoder.encode(payload.password()));
            }
            userMapper.updateById(entity);
            userRoleMapper.delete(new LambdaQueryWrapper<UserRoleEntity>().eq(UserRoleEntity::getUserId, entity.getId()));
        }
        if (payload.roleIds() != null) {
            payload.roleIds().forEach(roleId -> userRoleMapper.insert(UserRoleEntity.builder().userId(entity.getId()).roleId(roleId).build()));
        }
        return ApiResponse.success(userMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/users/{id}")
    @OperLog(module = "系统管理", action = "删除用户")
    @PreAuthorize("hasAuthority('system:user:delete')")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userRoleMapper.delete(new LambdaQueryWrapper<UserRoleEntity>().eq(UserRoleEntity::getUserId, id));
        userMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleView>> roles() {
        List<RoleView> rows = roleMapper.selectList(new LambdaQueryWrapper<RoleEntity>().orderByAsc(RoleEntity::getId))
                .stream()
                .map(role -> new RoleView(
                        role.getId(),
                        role.getName(),
                        role.getCode(),
                        role.getDataScope(),
                        role.getStatus(),
                        role.getRemark(),
                        lookupService.getMenuIdsByRoleId(role.getId())
                ))
                .toList();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/roles")
    @OperLog(module = "系统管理", action = "保存角色")
    public ApiResponse<RoleEntity> saveRole(@RequestBody RolePayload payload) {
        RoleEntity entity = payload.toRole();
        if (entity.getId() == null) {
            roleMapper.insert(entity);
        } else {
            roleMapper.updateById(entity);
            roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenuEntity>().eq(RoleMenuEntity::getRoleId, entity.getId()));
        }
        if (payload.menuIds() != null) {
            payload.menuIds().forEach(menuId -> roleMenuMapper.insert(RoleMenuEntity.builder().roleId(entity.getId()).menuId(menuId).build()));
        }
        return ApiResponse.success(roleMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/roles/{id}")
    @OperLog(module = "系统管理", action = "删除角色")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenuEntity>().eq(RoleMenuEntity::getRoleId, id));
        userRoleMapper.delete(new LambdaQueryWrapper<UserRoleEntity>().eq(UserRoleEntity::getRoleId, id));
        roleMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/menus")
    public ApiResponse<List<MenuEntity>> menus() {
        List<MenuEntity> rows = lookupService.listMenus();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/menus")
    @OperLog(module = "系统管理", action = "保存菜单")
    public ApiResponse<MenuEntity> saveMenu(@RequestBody MenuEntity entity) {
        validateMenu(entity);
        if (entity.getId() == null) {
            menuMapper.insert(entity);
        } else {
            menuMapper.updateById(entity);
        }
        return ApiResponse.success(menuMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/menus/{id}")
    @OperLog(module = "系统管理", action = "删除菜单")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        long childCount = menuMapper.selectCount(new LambdaQueryWrapper<MenuEntity>().eq(MenuEntity::getParentId, id));
        if (childCount > 0) {
            throw new BizException("A0400", "请先删除子菜单后再删除当前节点");
        }
        roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenuEntity>().eq(RoleMenuEntity::getMenuId, id));
        menuMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/depts")
    public ApiResponse<List<DeptEntity>> depts() {
        List<DeptEntity> rows = lookupService.listDepts();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/depts")
    public ApiResponse<DeptEntity> saveDept(@RequestBody DeptEntity entity) {
        validateDept(entity);
        if (entity.getId() == null) {
            deptMapper.insert(entity);
        } else {
            deptMapper.updateById(entity);
        }
        return ApiResponse.success(deptMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/depts/{id}")
    public ApiResponse<Void> deleteDept(@PathVariable Long id) {
        long childCount = deptMapper.selectCount(new LambdaQueryWrapper<DeptEntity>().eq(DeptEntity::getParentId, id));
        if (childCount > 0) {
            throw new BizException("A0400", "请先删除下级部门后再删除当前部门");
        }
        long userCount = userMapper.selectCount(new LambdaQueryWrapper<UserEntity>().eq(UserEntity::getDeptId, id));
        if (userCount > 0) {
            throw new BizException("A0400", "当前部门下仍有关联用户，无法直接删除");
        }
        deptMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/posts")
    public ApiResponse<List<PostEntity>> posts() {
        List<PostEntity> rows = lookupService.listPosts();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/posts")
    public ApiResponse<PostEntity> savePost(@RequestBody PostEntity entity) {
        if (entity.getId() == null) {
            postMapper.insert(entity);
        } else {
            postMapper.updateById(entity);
        }
        return ApiResponse.success(postMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> deletePost(@PathVariable Long id) {
        long userCount = userMapper.selectCount(new LambdaQueryWrapper<UserEntity>().eq(UserEntity::getPostId, id));
        if (userCount > 0) {
            throw new BizException("A0400", "当前岗位下仍有关联用户，无法直接删除");
        }
        postMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/dicts/types")
    public ApiResponse<List<DictTypeEntity>> dictTypes() {
        List<DictTypeEntity> rows = dictTypeMapper.selectList(new LambdaQueryWrapper<DictTypeEntity>().orderByAsc(DictTypeEntity::getId));
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @GetMapping("/dicts/data")
    public ApiResponse<List<DictDataEntity>> dictData() {
        List<DictDataEntity> rows = dictDataMapper.selectList(new LambdaQueryWrapper<DictDataEntity>().orderByAsc(DictDataEntity::getOrderNum));
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/dicts/types")
    public ApiResponse<DictTypeEntity> saveDictType(@RequestBody DictTypeEntity entity) {
        if (entity.getId() == null) {
            dictTypeMapper.insert(entity);
        } else {
            dictTypeMapper.updateById(entity);
        }
        return ApiResponse.success(dictTypeMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/dicts/types/{id}")
    public ApiResponse<Void> deleteDictType(@PathVariable Long id) {
        long dataCount = dictDataMapper.selectCount(new LambdaQueryWrapper<DictDataEntity>().eq(DictDataEntity::getTypeId, id));
        if (dataCount > 0) {
            throw new BizException("A0400", "请先删除字典数据后再删除字典类型");
        }
        dictTypeMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @PostMapping("/dicts/data")
    public ApiResponse<DictDataEntity> saveDictData(@RequestBody DictDataEntity entity) {
        if (entity.getId() == null) {
            dictDataMapper.insert(entity);
        } else {
            dictDataMapper.updateById(entity);
        }
        return ApiResponse.success(dictDataMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/dicts/data/{id}")
    public ApiResponse<Void> deleteDictData(@PathVariable Long id) {
        dictDataMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/configs")
    public ApiResponse<List<ConfigEntity>> configs() {
        List<ConfigEntity> rows = configMapper.selectList(new LambdaQueryWrapper<ConfigEntity>().orderByAsc(ConfigEntity::getId));
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/configs")
    public ApiResponse<ConfigEntity> saveConfig(@RequestBody ConfigEntity entity) {
        if (entity.getId() == null) {
            configMapper.insert(entity);
        } else {
            configMapper.updateById(entity);
        }
        return ApiResponse.success(configMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/configs/{id}")
    public ApiResponse<Void> deleteConfig(@PathVariable Long id) {
        ConfigEntity config = configMapper.selectById(id);
        if (config != null && Integer.valueOf(1).equals(config.getBuiltin())) {
            throw new BizException("A0400", "内置参数不允许删除");
        }
        configMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/notices")
    public ApiResponse<List<NoticeEntity>> notices() {
        List<NoticeEntity> rows = noticeMapper.selectList(new LambdaQueryWrapper<NoticeEntity>().orderByDesc(NoticeEntity::getId));
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/notices")
    public ApiResponse<NoticeEntity> saveNotice(@RequestBody NoticeEntity entity) {
        if (entity.getId() == null) {
            noticeMapper.insert(entity);
        } else {
            noticeMapper.updateById(entity);
        }
        return ApiResponse.success(noticeMapper.selectById(entity.getId()), RequestTraceContext.get());
    }

    @DeleteMapping("/notices/{id}")
    public ApiResponse<Void> deleteNotice(@PathVariable Long id) {
        noticeMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    private void validateMenu(MenuEntity entity) {
        if (entity.getParentId() != null && entity.getId() != null && entity.getParentId().equals(entity.getId())) {
            throw new BizException("A0400", "菜单不能选择自己作为上级");
        }
        if (entity.getParentId() != null && entity.getParentId() > 0) {
            MenuEntity parent = menuMapper.selectById(entity.getParentId());
            if (parent == null) {
                throw new BizException("A0400", "上级菜单不存在");
            }
            if ("BUTTON".equals(parent.getType())) {
                throw new BizException("A0400", "按钮类型节点不能作为上级菜单");
            }
        }
        if (lookupService.wouldCreateMenuCycle(entity.getId(), entity.getParentId())) {
            throw new BizException("A0400", "上级菜单不能选择当前菜单的下级节点");
        }
    }

    private void validateDept(DeptEntity entity) {
        if (entity.getParentId() != null && entity.getId() != null && entity.getParentId().equals(entity.getId())) {
            throw new BizException("A0400", "部门不能选择自己作为上级");
        }
        if (entity.getParentId() != null && entity.getParentId() > 0 && deptMapper.selectById(entity.getParentId()) == null) {
            throw new BizException("A0400", "上级部门不存在");
        }
        if (lookupService.wouldCreateDeptCycle(entity.getId(), entity.getParentId())) {
            throw new BizException("A0400", "上级部门不能选择当前部门的下级节点");
        }
    }

    public record UserPayload(
            Long id,
            String username,
            String password,
            String nickName,
            String email,
            String phone,
            Long deptId,
            Long postId,
            Integer status,
            String dataScope,
            List<Long> roleIds
    ) {
        UserEntity toUser() {
            return UserEntity.builder()
                    .id(id)
                    .username(username)
                    .nickName(nickName)
                    .email(email)
                    .phone(phone)
                    .deptId(deptId)
                    .postId(postId)
                    .status(status)
                    .dataScope(dataScope)
                    .build();
        }
    }

    public record RolePayload(
            Long id,
            String name,
            String code,
            String dataScope,
            Integer status,
            String remark,
            List<Long> menuIds
    ) {
        RoleEntity toRole() {
            return RoleEntity.builder().id(id).name(name).code(code).dataScope(dataScope).status(status).remark(remark).build();
        }
    }

    public record UserView(
            Long id,
            String username,
            String nickName,
            String email,
            String phone,
            Long deptId,
            String deptName,
            Long postId,
            String postName,
            Integer status,
            String dataScope,
            List<Long> roleIds
    ) {
    }

    public record RoleView(
            Long id,
            String name,
            String code,
            String dataScope,
            Integer status,
            String remark,
            List<Long> menuIds
    ) {
    }

    public record RoleOption(Long value, String label, String code) {
    }

    public record PostOption(Long value, String label, String code) {
    }

    public record SystemMetaView(
            List<RoleOption> roleOptions,
            List<PostOption> postOptions,
            List<DeptEntity> deptOptions,
            List<DeptTreeBuilder.DeptNode> deptTree,
            List<MenuEntity> menuOptions,
            List<MenuTreeBuilder.MenuNode> menuTree
    ) {
        public SystemMetaView {
            roleOptions = roleOptions == null ? Collections.emptyList() : roleOptions;
            postOptions = postOptions == null ? Collections.emptyList() : postOptions;
            deptOptions = deptOptions == null ? Collections.emptyList() : deptOptions;
            deptTree = deptTree == null ? Collections.emptyList() : deptTree;
            menuOptions = menuOptions == null ? Collections.emptyList() : menuOptions;
            menuTree = menuTree == null ? Collections.emptyList() : menuTree;
        }
    }
}
