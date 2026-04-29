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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ApiResponse<List<UserView>> users(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long deptId
    ) {
        List<Long> scopedDeptIds = collectDeptIdsWithChildren(deptId);
        List<Long> matchedDeptIds = findMatchingDeptIds(keyword);
        List<Long> matchedPostIds = findMatchingPostIds(keyword);

        LambdaQueryWrapper<UserEntity> query = new LambdaQueryWrapper<UserEntity>()
                .orderByAsc(UserEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> {
                wrapper.like(UserEntity::getUsername, keyword)
                        .or()
                        .like(UserEntity::getNickName, keyword)
                        .or()
                        .like(UserEntity::getEmail, keyword)
                        .or()
                        .like(UserEntity::getPhone, keyword);
                if (!matchedDeptIds.isEmpty()) {
                    wrapper.or().in(UserEntity::getDeptId, matchedDeptIds);
                }
                if (!matchedPostIds.isEmpty()) {
                    wrapper.or().in(UserEntity::getPostId, matchedPostIds);
                }
            });
        }
        if (status != null) {
            query.eq(UserEntity::getStatus, status);
        }
        if (!scopedDeptIds.isEmpty()) {
            query.in(UserEntity::getDeptId, scopedDeptIds);
        }

        List<UserView> rows = userMapper.selectList(query).stream().map(this::toUserView).toList();
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/users")
    @OperLog(module = "System", action = "Save user")
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
    @OperLog(module = "System", action = "Delete user")
    @PreAuthorize("hasAuthority('system:user:delete')")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userRoleMapper.delete(new LambdaQueryWrapper<UserRoleEntity>().eq(UserRoleEntity::getUserId, id));
        userMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleView>> roles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String dataScope
    ) {
        LambdaQueryWrapper<RoleEntity> query = new LambdaQueryWrapper<RoleEntity>()
                .orderByAsc(RoleEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(RoleEntity::getName, keyword)
                    .or()
                    .like(RoleEntity::getCode, keyword)
                    .or()
                    .like(RoleEntity::getRemark, keyword));
        }
        if (status != null) {
            query.eq(RoleEntity::getStatus, status);
        }
        if (StringUtils.hasText(dataScope)) {
            query.eq(RoleEntity::getDataScope, dataScope);
        }

        List<RoleView> rows = roleMapper.selectList(query)
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
    @OperLog(module = "System", action = "Save role")
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
    @OperLog(module = "System", action = "Delete role")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenuEntity>().eq(RoleMenuEntity::getRoleId, id));
        userRoleMapper.delete(new LambdaQueryWrapper<UserRoleEntity>().eq(UserRoleEntity::getRoleId, id));
        roleMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/menus")
    public ApiResponse<List<MenuEntity>> menus(@RequestParam(required = false) String keyword) {
        List<MenuEntity> rows = filterMenus(keyword);
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @PostMapping("/menus")
    @OperLog(module = "System", action = "Save menu")
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
    @OperLog(module = "System", action = "Delete menu")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        long childCount = menuMapper.selectCount(new LambdaQueryWrapper<MenuEntity>().eq(MenuEntity::getParentId, id));
        if (childCount > 0) {
            throw new BizException("A0400", "Delete child menus before deleting the current menu");
        }
        roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenuEntity>().eq(RoleMenuEntity::getMenuId, id));
        menuMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/depts")
    public ApiResponse<List<DeptEntity>> depts(@RequestParam(required = false) String keyword) {
        List<DeptEntity> rows = filterDepts(keyword);
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
            throw new BizException("A0400", "Delete child departments before deleting the current department");
        }
        long userCount = userMapper.selectCount(new LambdaQueryWrapper<UserEntity>().eq(UserEntity::getDeptId, id));
        if (userCount > 0) {
            throw new BizException("A0400", "Current department still has bound users");
        }
        deptMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/posts")
    public ApiResponse<List<PostEntity>> posts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status
    ) {
        LambdaQueryWrapper<PostEntity> query = new LambdaQueryWrapper<PostEntity>()
                .orderByAsc(PostEntity::getOrderNum)
                .orderByAsc(PostEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(PostEntity::getName, keyword)
                    .or()
                    .like(PostEntity::getCode, keyword)
                    .or()
                    .like(PostEntity::getRemark, keyword));
        }
        if (status != null) {
            query.eq(PostEntity::getStatus, status);
        }
        List<PostEntity> rows = postMapper.selectList(query);
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
            throw new BizException("A0400", "Current post still has bound users");
        }
        postMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/dicts/types")
    public ApiResponse<List<DictTypeEntity>> dictTypes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status
    ) {
        LambdaQueryWrapper<DictTypeEntity> query = new LambdaQueryWrapper<DictTypeEntity>()
                .orderByAsc(DictTypeEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(DictTypeEntity::getName, keyword)
                    .or()
                    .like(DictTypeEntity::getTypeCode, keyword)
                    .or()
                    .like(DictTypeEntity::getRemark, keyword));
        }
        if (status != null) {
            query.eq(DictTypeEntity::getStatus, status);
        }
        List<DictTypeEntity> rows = dictTypeMapper.selectList(query);
        return ApiResponse.success(rows, (long) rows.size(), RequestTraceContext.get());
    }

    @GetMapping("/dicts/data")
    public ApiResponse<List<DictDataEntity>> dictData(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) Integer status
    ) {
        LambdaQueryWrapper<DictDataEntity> query = new LambdaQueryWrapper<DictDataEntity>()
                .orderByAsc(DictDataEntity::getOrderNum);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(DictDataEntity::getLabel, keyword)
                    .or()
                    .like(DictDataEntity::getValue, keyword)
                    .or()
                    .like(DictDataEntity::getTagType, keyword));
        }
        if (typeId != null) {
            query.eq(DictDataEntity::getTypeId, typeId);
        }
        if (status != null) {
            query.eq(DictDataEntity::getStatus, status);
        }
        List<DictDataEntity> rows = dictDataMapper.selectList(query);
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
            throw new BizException("A0400", "Delete dictionary items before deleting the dictionary type");
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
    public ApiResponse<List<ConfigEntity>> configs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer builtin
    ) {
        LambdaQueryWrapper<ConfigEntity> query = new LambdaQueryWrapper<ConfigEntity>()
                .orderByAsc(ConfigEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(ConfigEntity::getName, keyword)
                    .or()
                    .like(ConfigEntity::getConfigKey, keyword)
                    .or()
                    .like(ConfigEntity::getConfigValue, keyword)
                    .or()
                    .like(ConfigEntity::getRemark, keyword));
        }
        if (builtin != null) {
            query.eq(ConfigEntity::getBuiltin, builtin);
        }
        List<ConfigEntity> rows = configMapper.selectList(query);
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
            throw new BizException("A0400", "Built-in config cannot be deleted");
        }
        configMapper.deleteById(id);
        return ApiResponse.success(null, RequestTraceContext.get());
    }

    @GetMapping("/notices")
    public ApiResponse<List<NoticeEntity>> notices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status
    ) {
        LambdaQueryWrapper<NoticeEntity> query = new LambdaQueryWrapper<NoticeEntity>()
                .orderByDesc(NoticeEntity::getId);
        if (StringUtils.hasText(keyword)) {
            query.and(wrapper -> wrapper
                    .like(NoticeEntity::getTitle, keyword)
                    .or()
                    .like(NoticeEntity::getContent, keyword));
        }
        if (StringUtils.hasText(type)) {
            query.eq(NoticeEntity::getType, type);
        }
        if (status != null) {
            query.eq(NoticeEntity::getStatus, status);
        }
        List<NoticeEntity> rows = noticeMapper.selectList(query);
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

    private UserView toUserView(UserEntity user) {
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
    }

    private List<Long> collectDeptIdsWithChildren(Long deptId) {
        if (deptId == null) {
            return Collections.emptyList();
        }
        List<DeptEntity> allDepts = lookupService.listDepts();
        Set<Long> included = new HashSet<>();
        included.add(deptId);
        boolean changed = true;
        while (changed) {
            changed = false;
            for (DeptEntity dept : allDepts) {
                if (dept.getParentId() != null && included.contains(dept.getParentId()) && included.add(dept.getId())) {
                    changed = true;
                }
            }
        }
        return included.stream().toList();
    }

    private List<Long> findMatchingDeptIds(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Collections.emptyList();
        }
        return lookupService.listDepts().stream()
                .filter(item -> contains(item.getName(), keyword)
                        || contains(item.getLeader(), keyword)
                        || contains(item.getPhone(), keyword)
                        || contains(item.getEmail(), keyword))
                .map(DeptEntity::getId)
                .toList();
    }

    private List<Long> findMatchingPostIds(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Collections.emptyList();
        }
        return lookupService.listPosts().stream()
                .filter(item -> contains(item.getName(), keyword)
                        || contains(item.getCode(), keyword)
                        || contains(item.getRemark(), keyword))
                .map(PostEntity::getId)
                .toList();
    }

    private List<MenuEntity> filterMenus(String keyword) {
        List<MenuEntity> allMenus = lookupService.listMenus();
        if (!StringUtils.hasText(keyword)) {
            return allMenus;
        }
        Map<Long, MenuEntity> menuMap = new HashMap<>();
        for (MenuEntity menu : allMenus) {
            menuMap.put(menu.getId(), menu);
        }
        Set<Long> includedIds = new HashSet<>();
        for (MenuEntity menu : allMenus) {
            if (contains(menu.getName(), keyword)
                    || contains(menu.getPath(), keyword)
                    || contains(menu.getComponent(), keyword)
                    || contains(menu.getPermissionCode(), keyword)) {
                includeAncestors(menu.getId(), menuMap, includedIds, MenuEntity::getParentId);
            }
        }
        return allMenus.stream().filter(item -> includedIds.contains(item.getId())).toList();
    }

    private List<DeptEntity> filterDepts(String keyword) {
        List<DeptEntity> allDepts = lookupService.listDepts();
        if (!StringUtils.hasText(keyword)) {
            return allDepts;
        }
        Map<Long, DeptEntity> deptMap = new HashMap<>();
        for (DeptEntity dept : allDepts) {
            deptMap.put(dept.getId(), dept);
        }
        Set<Long> includedIds = new HashSet<>();
        for (DeptEntity dept : allDepts) {
            if (contains(dept.getName(), keyword)
                    || contains(dept.getLeader(), keyword)
                    || contains(dept.getPhone(), keyword)
                    || contains(dept.getEmail(), keyword)) {
                includeAncestors(dept.getId(), deptMap, includedIds, DeptEntity::getParentId);
            }
        }
        return allDepts.stream().filter(item -> includedIds.contains(item.getId())).toList();
    }

    private <T> void includeAncestors(Long id, Map<Long, T> itemMap, Set<Long> includedIds, Function<T, Long> parentIdGetter) {
        Long currentId = id;
        while (currentId != null && currentId > 0 && includedIds.add(currentId)) {
            T current = itemMap.get(currentId);
            if (current == null) {
                return;
            }
            currentId = parentIdGetter.apply(current);
        }
    }

    private boolean contains(String value, String keyword) {
        return StringUtils.hasText(value) && value.toLowerCase().contains(keyword.toLowerCase());
    }

    private void validateMenu(MenuEntity entity) {
        if (entity.getParentId() != null && entity.getId() != null && entity.getParentId().equals(entity.getId())) {
            throw new BizException("A0400", "Menu cannot choose itself as parent");
        }
        if (entity.getParentId() != null && entity.getParentId() > 0) {
            MenuEntity parent = menuMapper.selectById(entity.getParentId());
            if (parent == null) {
                throw new BizException("A0400", "Parent menu does not exist");
            }
            if ("BUTTON".equals(parent.getType())) {
                throw new BizException("A0400", "Button node cannot be used as parent menu");
            }
        }
        if (lookupService.wouldCreateMenuCycle(entity.getId(), entity.getParentId())) {
            throw new BizException("A0400", "Parent menu cannot be a child of the current menu");
        }
    }

    private void validateDept(DeptEntity entity) {
        if (entity.getParentId() != null && entity.getId() != null && entity.getParentId().equals(entity.getId())) {
            throw new BizException("A0400", "Department cannot choose itself as parent");
        }
        if (entity.getParentId() != null && entity.getParentId() > 0 && deptMapper.selectById(entity.getParentId()) == null) {
            throw new BizException("A0400", "Parent department does not exist");
        }
        if (lookupService.wouldCreateDeptCycle(entity.getId(), entity.getParentId())) {
            throw new BizException("A0400", "Parent department cannot be a child of the current department");
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
