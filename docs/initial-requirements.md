# Tiny Admin 初始任务说明

## 项目目标

在 `D:\JavaProject\tiny-admin` 中从零建设一套“后端单体 + React 管理端”的现代化后台系统，首期交付可直接用于二次开发的平台底座，不绑定具体行业业务，仅保留一套示例业务模块用于验证扩展方式。

## 默认技术方案

- 后端：Java 17、Spring Boot 3、Spring Security 6、MyBatis-Plus、MySQL、Redis
- 前端：React 18、Vite、Ant Design、ProComponents、React Router、Zustand 或 Redux Toolkit
- 认证：JWT + Redis
- 部署：Docker Compose
- 架构：模块化单体
- 交互：双栏增强型中后台

## 工程结构

### 顶层目录

- `tiny-admin-server`
- `tiny-admin-web`
- `deploy`

### 后端模块边界

- `tiny-admin-boot`：启动器、配置装配、统一异常、OpenAPI、跨域与环境配置
- `tiny-admin-common`：通用响应、分页、枚举、工具类、审计注解、基础领域类型
- `tiny-admin-infra`：MyBatis-Plus、Redis、文件存储、本地缓存、定时任务基础设施
- `tiny-admin-auth`：登录、登出、JWT、刷新、验证码、在线会话、权限装载
- `tiny-admin-system`：用户、角色、菜单、部门、岗位、字典、参数、通知公告
- `tiny-admin-audit`：操作日志、登录日志、审计事件
- `tiny-admin-monitor`：服务监控、缓存监控、在线用户
- `tiny-admin-scheduler`：定时任务、执行日志、启停控制
- `tiny-admin-demo`：示例业务模块，验证菜单、权限、列表、表单和日志链路

### 前端目录约定

- `src/app`：应用壳、路由、全局状态、主题、权限守卫
- `src/layouts`：双栏增强型布局、一级导航、二级菜单、顶部工具区
- `src/features/auth`
- `src/features/system`
- `src/features/audit`
- `src/features/monitor`
- `src/features/scheduler`
- `src/features/demo`
- `src/shared`：请求层、表格/查询/表单公共组件、权限指令、字典 hooks

## 首期能力范围

### 必做能力

- 认证登录：账号密码登录、验证码、登出、Token 刷新、个人信息、修改密码
- 权限体系：用户、角色、菜单、按钮权限、数据范围、部门树、岗位
- 系统配置：字典类型/数据、系统参数、通知公告
- 审计日志：登录日志、操作日志、异常日志摘要
- 在线用户：会话列表、强制下线、最后活跃时间
- 运维监控：服务信息、JVM/CPU/内存/磁盘、Redis 信息、缓存键统计
- 定时任务：任务 CRUD、Cron 校验、启停、手动执行、执行日志
- 文件能力：统一上传接口，默认本地存储，预留后续 OSS/S3 扩展点
- 示例业务：一套标准 CRUD 业务，作为真实业务扩展模板

### 首期不纳入

- 代码生成
- 多租户
- 工作流
- 复杂消息推送
- 微服务拆分
- SaaS 级租户隔离

## 核心数据模型

核心表按平台域拆分，命名采用 `sys_* / job_* / demo_*` 风格：

- `sys_user`
- `sys_role`
- `sys_menu`
- `sys_dept`
- `sys_post`
- `sys_user_role`
- `sys_role_menu`
- `sys_dict_type`
- `sys_dict_data`
- `sys_config`
- `sys_notice`
- `sys_oper_log`
- `sys_login_log`
- `sys_online_user`
- `job_info`
- `job_log`

## 接口约定

### 鉴权接口

- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/refresh`
- `/api/auth/profile`

### 系统管理接口

- `/api/system/users`
- `/api/system/roles`
- `/api/system/menus`
- `/api/system/depts`
- `/api/system/posts`
- `/api/system/dicts`
- `/api/system/configs`
- `/api/system/notices`

### 审计与监控接口

- `/api/audit/oper-logs`
- `/api/audit/login-logs`
- `/api/monitor/server`
- `/api/monitor/cache`
- `/api/monitor/online-users`

### 调度与文件接口

- `/api/scheduler/jobs`
- `/api/scheduler/job-logs`
- `/api/files/upload`

### 统一响应格式

- `code`
- `message`
- `data`
- `traceId`
- 分页接口额外返回 `total`

## 前端交互方向

### 布局

- 一级导航承载系统管理、审计日志、运维监控、任务调度、示例业务
- 左侧展示当前一级模块的二级菜单
- 顶部区域提供全局搜索、消息占位、主题切换、全屏、用户中心
- 首页为现代化工作台，但不替代菜单入口

### 页面策略

- 列表页统一为“筛选区 + 表格区 + 批量操作区”
- 表单页统一支持抽屉、弹窗、整页三种容器策略
- 权限、字典、状态标签、日期范围、上传组件统一封装

## 交付标准

- `docker compose up` 可拉起 `mysql + redis + server + web`
- 初始化 SQL 可一键建库建表并写入管理员、角色、菜单、字典等基础数据
- 登录后可完整访问平台管理能力
- 示例业务可证明平台具备可扩展性
- 提供开发环境、部署环境、初始化账号、常见命令说明

## 公共类型

- `LoginRequest`：用户名、密码、验证码、验证码 key
- `LoginResponse`：accessToken、refreshToken、expiresAt、userInfo、permissions
- `CurrentUser`：基础资料、角色、岗位、部门、数据范围
- `MenuNode`：id、parentId、name、path、component、icon、type、permission、children
- `PageQuery`：pageNum、pageSize、sortField、sortOrder
- `PageResult<T>`：rows、total
- `ApiResponse<T>`：code、message、data、traceId
- `JobDefinition`：名称、分组、Cron、目标 bean/method、参数、状态
- `FileUploadResult`：fileId、url、name、size、contentType

## 测试范围

### 后端

- 登录成功、验证码错误、密码错误、Token 过期、刷新成功、强制下线
- 用户、角色、菜单、部门、岗位、字典、参数、公告的增删改查与权限拦截
- 数据范围在列表查询中的正确生效
- 操作日志与登录日志的自动落库
- 定时任务的创建、停用、手动执行、执行日志记录
- Redis 会话与在线用户状态的一致性
- 文件上传的类型、大小、存储路径校验

### 前端

- 登录页、首次加载、菜单渲染、动态路由注册
- 按钮权限显隐、无权限路由拦截、会话过期回登录
- 用户管理、角色管理、菜单管理、字典管理、任务调度主流程
- 工作台、监控页、日志页在桌面端和常见笔记本分辨率下正常使用
- 布局折叠、主题切换、Tab 导航、面包屑、全局搜索交互正常

### 验收场景

- 使用管理员账号完成系统全量基础配置
- 新建角色并分配菜单与按钮权限，新建用户后登录验证生效
- 新建一条定时任务并手动执行，查看执行日志
- 查看在线用户并强制下线指定账号
- 通过示例业务验证新增菜单、权限点、列表页、表单页的扩展链路完整

## 默认假设

- 数据库使用 MySQL 8
- Redis 用于登录态、在线用户和缓存统计
- 文件上传首期使用本地磁盘存储
- 只做简体中文后台，不做国际化
- 不做多租户与复杂组织隔离
- 示例业务仅作为扩展示例，不承载真实生产规则
