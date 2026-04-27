INSERT INTO sys_dept (id, parent_id, name, order_num, leader, phone, email, status)
VALUES (1, 0, '平台总部', 1, '管理员', '13800000000', 'admin@tinyadmin.local', 1);

INSERT INTO sys_post (id, name, code, order_num, status, remark)
VALUES (1, '平台管理员岗', 'platform_admin', 1, 1, '默认管理员岗位');

INSERT INTO sys_user (id, username, password, nick_name, email, phone, dept_id, post_id, status, data_scope)
VALUES (1, 'admin', 'admin123', '系统管理员', 'admin@tinyadmin.local', '13800000000', 1, 1, 1, 'ALL');

INSERT INTO sys_role (id, name, code, data_scope, status, remark)
VALUES (1, '超级管理员', 'SUPER_ADMIN', 'ALL', 1, '默认超级管理员角色');

INSERT INTO sys_user_role (id, user_id, role_id) VALUES (1, 1, 1);

INSERT INTO sys_menu (id, parent_id, name, path, component, icon, type, permission_code, order_num, visible, status) VALUES
(1, 0, '系统管理', '/system', 'layout', 'SettingOutlined', 'CATALOG', '', 1, 1, 1),
(2, 1, '用户管理', '/system/users', '/system/users', 'UserOutlined', 'MENU', 'system:user:list', 1, 1, 1),
(3, 1, '角色管理', '/system/roles', '/system/roles', 'TeamOutlined', 'MENU', 'system:role:list', 2, 1, 1),
(4, 1, '菜单管理', '/system/menus', '/system/menus', 'MenuOutlined', 'MENU', 'system:menu:list', 3, 1, 1),
(5, 1, '部门管理', '/system/depts', '/system/depts', 'ApartmentOutlined', 'MENU', 'system:dept:list', 4, 1, 1),
(6, 1, '岗位管理', '/system/posts', '/system/posts', 'SolutionOutlined', 'MENU', 'system:post:list', 5, 1, 1),
(7, 1, '字典管理', '/system/dicts', '/system/dicts', 'BookOutlined', 'MENU', 'system:dict:list', 6, 1, 1),
(8, 1, '参数管理', '/system/configs', '/system/configs', 'ControlOutlined', 'MENU', 'system:config:list', 7, 1, 1),
(9, 1, '通知公告', '/system/notices', '/system/notices', 'NotificationOutlined', 'MENU', 'system:notice:list', 8, 1, 1),
(10, 0, '审计日志', '/audit', 'layout', 'HistoryOutlined', 'CATALOG', '', 2, 1, 1),
(11, 10, '操作日志', '/audit/oper-logs', '/audit/oper-logs', 'AuditOutlined', 'MENU', 'audit:oper:list', 1, 1, 1),
(12, 10, '登录日志', '/audit/login-logs', '/audit/login-logs', 'LoginOutlined', 'MENU', 'audit:login:list', 2, 1, 1),
(13, 0, '运维监控', '/monitor', 'layout', 'DashboardOutlined', 'CATALOG', '', 3, 1, 1),
(14, 13, '服务监控', '/monitor/server', '/monitor/server', 'DashboardOutlined', 'MENU', 'monitor:server:view', 1, 1, 1),
(15, 13, '缓存监控', '/monitor/cache', '/monitor/cache', 'DatabaseOutlined', 'MENU', 'monitor:cache:view', 2, 1, 1),
(16, 13, '在线用户', '/monitor/online-users', '/monitor/online-users', 'GlobalOutlined', 'MENU', 'monitor:online:list', 3, 1, 1),
(17, 0, '任务调度', '/scheduler', 'layout', 'ClockCircleOutlined', 'CATALOG', '', 4, 1, 1),
(18, 17, '定时任务', '/scheduler/jobs', '/scheduler/jobs', 'ClockCircleOutlined', 'MENU', 'scheduler:job:list', 1, 1, 1),
(19, 17, '执行日志', '/scheduler/job-logs', '/scheduler/job-logs', 'ProfileOutlined', 'MENU', 'scheduler:log:list', 2, 1, 1),
(20, 0, '示例业务', '/demo', 'layout', 'RocketOutlined', 'CATALOG', '', 5, 1, 1),
(21, 20, '项目列表', '/demo/projects', '/demo/projects', 'ProjectOutlined', 'MENU', 'demo:project:list', 1, 1, 1),
(22, 2, '保存用户', '', '', '', 'BUTTON', 'system:user:save', 11, 1, 1),
(23, 2, '删除用户', '', '', '', 'BUTTON', 'system:user:delete', 12, 1, 1);

INSERT INTO sys_role_menu (id, role_id, menu_id)
SELECT id, 1, id FROM sys_menu;

INSERT INTO sys_dict_type (id, name, type_code, status, remark)
VALUES (1, '用户状态', 'sys_user_status', 1, '用户状态字典');

INSERT INTO sys_dict_data (id, type_id, label, dict_value, tag_type, order_num, status) VALUES
(1, 1, '启用', '1', 'success', 1, 1),
(2, 1, '停用', '0', 'default', 2, 1);

INSERT INTO sys_config (id, config_key, config_value, name, builtin, remark)
VALUES (1, 'sys.theme.primaryColor', '#18B8C9', '主题主色', 1, '默认主色配置');

INSERT INTO sys_notice (id, title, type, content, status)
VALUES (1, '欢迎使用 Tiny Admin', 'INFO', '平台底座能力已初始化完成，可继续接入真实业务模块。', 1);

INSERT INTO job_info (id, name, job_group, cron_expression, target_bean, target_method, args, status)
VALUES (1, '演示心跳任务', 'system', '0 0/30 * * * ?', 'demoTaskExecutor', 'heartbeat', 'seed data job', 1);

INSERT INTO demo_project (id, name, owner, status, description)
VALUES
(1, '增长看板升级', '王晨', '进行中', '用于验证 CRUD、权限和审计日志链路。'),
(2, '客户画像重构', '李雪', '规划中', '用于验证业务模块接入菜单、权限和日志体系的方式。');
