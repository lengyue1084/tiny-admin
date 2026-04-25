# Tiny Admin

Tiny Admin 是一套面向企业中后台场景的单体后台系统，采用“Spring Boot 单体后端 + React 管理端”的交付形态。

## 技术栈

- 后端：Java 17、Spring Boot 3、Spring Security 6、MyBatis-Plus、Quartz、MySQL、Redis
- 前端：React 18、Vite、Ant Design、Zustand、Axios
- 部署：Docker Compose

## 默认账号

- 用户名：`admin`
- 密码：`admin123`

## 本地开发

### 前端

```bash
cd tiny-admin-web
npm install
npm run dev
```

前端默认代理到 `http://localhost:8080`。

### 后端

```bash
cd deploy
docker compose up --build
```

启动后访问：

- 前端：[http://localhost](http://localhost)
- 后端接口文档：[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## 首期功能

- 登录认证、验证码、JWT + Redis 会话
- 用户、角色、菜单、部门、岗位
- 字典、参数、通知公告
- 操作日志、登录日志、在线用户
- 服务监控、缓存监控
- 定时任务与执行日志
- 文件上传
- 示例业务模块

## 文档

- 初始任务说明：[docs/initial-requirements.md](/D:/JavaProject/tiny-admin/docs/initial-requirements.md)
