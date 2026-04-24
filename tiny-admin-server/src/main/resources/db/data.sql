INSERT INTO sys_dept (id, parent_id, name, order_num, leader, phone, email, status)
VALUES (1, 0, 'Tiny Admin HQ', 1, 'Admin', '13800000000', 'admin@tinyadmin.local', 1);

INSERT INTO sys_post (id, name, code, order_num, status, remark)
VALUES (1, 'Platform Admin', 'platform_admin', 1, 1, 'Default administrator post');

INSERT INTO sys_user (id, username, password, nick_name, email, phone, dept_id, post_id, status, data_scope)
VALUES (1, 'admin', 'admin123', 'System Admin', 'admin@tinyadmin.local', '13800000000', 1, 1, 1, 'ALL');

INSERT INTO sys_role (id, name, code, data_scope, status, remark)
VALUES (1, 'Super Admin', 'SUPER_ADMIN', 'ALL', 1, 'Default super administrator');

INSERT INTO sys_user_role (id, user_id, role_id) VALUES (1, 1, 1);

INSERT INTO sys_menu (id, parent_id, name, path, component, icon, type, permission_code, order_num, visible, status) VALUES
(1, 0, 'System Management', '/system', 'layout', 'SettingOutlined', 'CATALOG', '', 1, 1, 1),
(2, 1, 'User Management', '/system/users', '/system/users', 'UserOutlined', 'MENU', 'system:user:list', 1, 1, 1),
(3, 1, 'Role Management', '/system/roles', '/system/roles', 'TeamOutlined', 'MENU', 'system:role:list', 2, 1, 1),
(4, 1, 'Menu Management', '/system/menus', '/system/menus', 'MenuOutlined', 'MENU', 'system:menu:list', 3, 1, 1),
(5, 1, 'Department Management', '/system/depts', '/system/depts', 'ApartmentOutlined', 'MENU', 'system:dept:list', 4, 1, 1),
(6, 1, 'Post Management', '/system/posts', '/system/posts', 'SolutionOutlined', 'MENU', 'system:post:list', 5, 1, 1),
(7, 1, 'Dictionary Management', '/system/dicts', '/system/dicts', 'BookOutlined', 'MENU', 'system:dict:list', 6, 1, 1),
(8, 1, 'Config Management', '/system/configs', '/system/configs', 'ControlOutlined', 'MENU', 'system:config:list', 7, 1, 1),
(9, 1, 'Notices', '/system/notices', '/system/notices', 'NotificationOutlined', 'MENU', 'system:notice:list', 8, 1, 1),
(10, 0, 'Audit Logs', '/audit', 'layout', 'HistoryOutlined', 'CATALOG', '', 2, 1, 1),
(11, 10, 'Operation Logs', '/audit/oper-logs', '/audit/oper-logs', 'AuditOutlined', 'MENU', 'audit:oper:list', 1, 1, 1),
(12, 10, 'Login Logs', '/audit/login-logs', '/audit/login-logs', 'LoginOutlined', 'MENU', 'audit:login:list', 2, 1, 1),
(13, 0, 'Monitoring', '/monitor', 'layout', 'DashboardOutlined', 'CATALOG', '', 3, 1, 1),
(14, 13, 'Server Monitor', '/monitor/server', '/monitor/server', 'DashboardOutlined', 'MENU', 'monitor:server:view', 1, 1, 1),
(15, 13, 'Cache Monitor', '/monitor/cache', '/monitor/cache', 'DatabaseOutlined', 'MENU', 'monitor:cache:view', 2, 1, 1),
(16, 13, 'Online Users', '/monitor/online-users', '/monitor/online-users', 'GlobalOutlined', 'MENU', 'monitor:online:list', 3, 1, 1),
(17, 0, 'Scheduler', '/scheduler', 'layout', 'ClockCircleOutlined', 'CATALOG', '', 4, 1, 1),
(18, 17, 'Jobs', '/scheduler/jobs', '/scheduler/jobs', 'ClockCircleOutlined', 'MENU', 'scheduler:job:list', 1, 1, 1),
(19, 17, 'Job Logs', '/scheduler/job-logs', '/scheduler/job-logs', 'ProfileOutlined', 'MENU', 'scheduler:log:list', 2, 1, 1),
(20, 0, 'Demo Business', '/demo', 'layout', 'RocketOutlined', 'CATALOG', '', 5, 1, 1),
(21, 20, 'Project List', '/demo/projects', '/demo/projects', 'ProjectOutlined', 'MENU', 'demo:project:list', 1, 1, 1),
(22, 2, 'Save User', '', '', '', 'BUTTON', 'system:user:save', 11, 1, 1),
(23, 2, 'Delete User', '', '', '', 'BUTTON', 'system:user:delete', 12, 1, 1);

INSERT INTO sys_role_menu (id, role_id, menu_id)
SELECT id, 1, id FROM sys_menu;

INSERT INTO sys_dict_type (id, name, type_code, status, remark)
VALUES (1, 'User Status', 'sys_user_status', 1, 'User status dictionary');

INSERT INTO sys_dict_data (id, type_id, label, dict_value, tag_type, order_num, status) VALUES
(1, 1, 'Enabled', '1', 'success', 1, 1),
(2, 1, 'Disabled', '0', 'default', 2, 1);

INSERT INTO sys_config (id, config_key, config_value, name, builtin, remark)
VALUES (1, 'sys.theme.primaryColor', '#125BFF', 'Primary Color', 1, 'Default primary color');

INSERT INTO sys_notice (id, title, type, content, status)
VALUES (1, 'Welcome to Tiny Admin', 'INFO', 'The platform foundation is ready for business extensions.', 1);

INSERT INTO job_info (id, name, job_group, cron_expression, target_bean, target_method, args, status)
VALUES (1, 'Demo Heartbeat Job', 'system', '0 0/30 * * * ?', 'demoTaskExecutor', 'heartbeat', 'scheduled from seed data', 1);

INSERT INTO demo_project (id, name, owner, status, description)
VALUES
(1, 'Growth Dashboard Upgrade', 'Wang Chen', 'In Progress', 'Used to validate CRUD, permissions, and audit flow.'),
(2, 'Customer Profile Refactor', 'Li Xue', 'Planned', 'Used to verify how business modules plug into platform menus and auditing.');
