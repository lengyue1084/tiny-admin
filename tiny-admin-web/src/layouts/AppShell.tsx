import {
  ApartmentOutlined,
  AuditOutlined,
  BookOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  HistoryOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RocketOutlined,
  SearchOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { Avatar, Breadcrumb, Button, Dropdown, Input, Layout, Menu, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import { DashboardHome } from '../features/dashboard/DashboardHome'
import { SystemUsersPage, SystemRolesPage, SystemMenusPage, SystemDeptsPage, SystemPostsPage, SystemDictsPage, SystemConfigsPage, SystemNoticesPage } from '../features/system/SystemPages'
import { AuditLoginLogsPage, AuditOperLogsPage } from '../features/audit/AuditPages'
import { MonitorCachePage, MonitorOnlineUsersPage, MonitorServerPage } from '../features/monitor/MonitorPages'
import { SchedulerJobsPage, SchedulerLogsPage } from '../features/scheduler/SchedulerPages'
import { DemoProjectsPage } from '../features/demo/DemoProjectsPage'

const { Header, Sider, Content } = Layout

const iconMap: Record<string, React.ReactNode> = {
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  MenuOutlined: <AuditOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  BookOutlined: <BookOutlined />,
  ControlOutlined: <ControlOutlined />,
  NotificationOutlined: <NotificationOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  AuditOutlined: <AuditOutlined />,
  LoginOutlined: <LoginOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  RocketOutlined: <RocketOutlined />,
  ProjectOutlined: <ProjectOutlined />,
}

const pageRegistry: Record<string, ReactNode> = {
  '/': <DashboardHome />,
  '/system/users': <SystemUsersPage />,
  '/system/roles': <SystemRolesPage />,
  '/system/menus': <SystemMenusPage />,
  '/system/depts': <SystemDeptsPage />,
  '/system/posts': <SystemPostsPage />,
  '/system/dicts': <SystemDictsPage />,
  '/system/configs': <SystemConfigsPage />,
  '/system/notices': <SystemNoticesPage />,
  '/audit/oper-logs': <AuditOperLogsPage />,
  '/audit/login-logs': <AuditLoginLogsPage />,
  '/monitor/server': <MonitorServerPage />,
  '/monitor/cache': <MonitorCachePage />,
  '/monitor/online-users': <MonitorOnlineUsersPage />,
  '/scheduler/jobs': <SchedulerJobsPage />,
  '/scheduler/job-logs': <SchedulerLogsPage />,
  '/demo/projects': <DemoProjectsPage />,
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, menus, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const categories = useMemo(
    () => menus.filter((menu) => menu.type === 'CATALOG').sort((a, b) => a.orderNum - b.orderNum),
    [menus],
  )

  const activeCategory = useMemo(() => {
    return categories.find((menu) => location.pathname.startsWith(menu.path)) ?? categories[0]
  }, [categories, location.pathname])

  const sidebarMenus = activeCategory?.children ?? []

  const page = pageRegistry[location.pathname] ?? pageRegistry['/']

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout className="shell">
      <Sider width={112} className="shell__rail" theme="light">
        <div className="brand">
          <div className="brand__badge">TA</div>
          <div className="brand__meta">
            <span>Tiny</span>
            <strong>Admin</strong>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={activeCategory ? [activeCategory.path] : []}
          items={categories.map((item) => ({
            key: item.path,
            icon: iconMap[item.icon ?? 'DashboardOutlined'] ?? <DashboardOutlined />,
            label: item.name,
            onClick: () => {
              const fallbackPath = item.children?.[0]?.path || '/'
              navigate(fallbackPath)
            },
          }))}
        />
      </Sider>

      <Sider width={collapsed ? 96 : 264} collapsed={collapsed} theme="light" className="shell__sidebar" collapsedWidth={96}>
        <div className="shell__sidebarHeader">
          <div>
            <Tag color="blue">当前模块</Tag>
            <Typography.Title level={4}>{activeCategory?.name ?? '工作台'}</Typography.Title>
          </div>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((value) => !value)} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={sidebarMenus.map((item) => ({
            key: item.path,
            icon: iconMap[item.icon ?? 'DashboardOutlined'] ?? <DashboardOutlined />,
            label: item.name,
            onClick: () => navigate(item.path),
          }))}
        />
      </Sider>

      <Layout className="shell__contentWrap">
        <Header className="shell__header">
          <Space size="large">
            <Input prefix={<SearchOutlined />} placeholder="搜索菜单、页面或操作" className="search-box" />
            <Breadcrumb
              items={[
                { title: '工作台' },
                ...(activeCategory ? [{ title: activeCategory.name }] : []),
                ...(location.pathname !== '/' ? [{ title: sidebarMenus.find((item) => item.path === location.pathname)?.name ?? '页面' }] : []),
              ]}
            />
          </Space>
          <Space size="middle">
            <Tag color="cyan">{user.roles.join(' / ')}</Tag>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => void logout().then(() => navigate('/login')),
                  },
                ],
              }}
            >
              <Space className="profile-chip">
                <Avatar>{user.nickName[0]}</Avatar>
                <div>
                  <strong>{user.nickName}</strong>
                  <span>{user.deptName || '平台团队'}</span>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="shell__main">{page}</Content>
      </Layout>
    </Layout>
  )
}
