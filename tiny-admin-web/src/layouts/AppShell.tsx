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
  HomeOutlined,
  LockOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RightOutlined,
  RocketOutlined,
  SearchOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { AutoComplete, Avatar, Breadcrumb, Button, Descriptions, Dropdown, Form, Input, Layout, Modal, Tag, message } from 'antd'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import { AuditLoginLogsPage, AuditOperLogsPage } from '../features/audit/AuditPages'
import { LoginPage } from '../features/auth/LoginPage'
import { DashboardHome } from '../features/dashboard/DashboardHome'
import { DemoProjectsPage } from '../features/demo/DemoProjectsPage'
import { MonitorCachePage, MonitorOnlineUsersPage, MonitorServerPage } from '../features/monitor/MonitorPages'
import { SchedulerJobsPage, SchedulerLogsPage } from '../features/scheduler/SchedulerPages'
import {
  SystemConfigsPage,
  SystemDeptsPage,
  SystemDictsPage,
  SystemMenusPage,
  SystemNoticesPage,
  SystemPostsPage,
  SystemRolesPage,
  SystemUsersPage,
} from '../features/system/SystemPages'
import { authApi } from '../shared/api/services'

const { Header, Content } = Layout

const iconMap: Record<string, ReactNode> = {
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
  '/login': <LoginPage />,
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

type SearchEntry = {
  value: string
  category: string
  title: string
  hint: string
  keywords: string[]
}

type PasswordFormValues = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, menus, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const [profileVisible, setProfileVisible] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordForm] = Form.useForm<PasswordFormValues>()

  const categories = useMemo(
    () => menus.filter((menu) => menu.type === 'CATALOG').sort((a, b) => a.orderNum - b.orderNum),
    [menus],
  )

  const activeCategory = useMemo(
    () => categories.find((menu) => location.pathname.startsWith(menu.path)) ?? null,
    [categories, location.pathname],
  )

  const currentMenu = useMemo(
    () => activeCategory?.children?.find((item) => item.path === location.pathname) ?? null,
    [activeCategory?.children, location.pathname],
  )

  useEffect(() => {
    if (!collapsed) {
      setExpandedCategoryId(activeCategory?.id ?? null)
    }
  }, [activeCategory?.id, collapsed])

  const page = pageRegistry[location.pathname] ?? pageRegistry['/']

  const searchEntries = useMemo<SearchEntry[]>(() => {
    const entries: SearchEntry[] = [
      {
        value: '/',
        category: '平台总览',
        title: '工作台',
        hint: '查看平台指标、推进节奏与下一步建议',
        keywords: ['工作台', '首页', 'dashboard', '平台总览'],
      },
    ]

    for (const category of categories) {
      for (const child of category.children ?? []) {
        entries.push({
          value: child.path,
          category: category.name,
          title: child.name,
          hint: `${category.name} · ${child.path}`,
          keywords: [category.name, child.name, child.path, child.permission ?? ''],
        })
      }
    }

    return entries
  }, [categories])

  const searchOptions = useMemo(() => {
    const query = globalSearch.trim().toLowerCase()
    const visibleEntries = query
      ? searchEntries.filter((entry) => entry.keywords.some((keyword) => keyword.toLowerCase().includes(query)))
      : searchEntries

    return visibleEntries.slice(0, 8).map((entry) => ({
      value: entry.value,
      label: (
        <div className="shell__searchOption">
          <strong>{entry.title}</strong>
          <span>{entry.hint}</span>
        </div>
      ),
    }))
  }, [globalSearch, searchEntries])

  const handlePasswordSubmit = async () => {
    const values = await passwordForm.validateFields()
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setFields([
        {
          name: 'confirmPassword',
          errors: ['两次输入的新密码不一致'],
        },
      ])
      return
    }

    setSavingPassword(true)
    try {
      await authApi.updatePassword(values.oldPassword, values.newPassword)
      message.success('密码已更新，请使用新密码重新登录')
      passwordForm.resetFields()
      setPasswordVisible(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '密码更新失败')
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout className="shell">
      <aside className={clsx('shell__sidebar', collapsed && 'shell__sidebar--collapsed')}>
        <div className="shell__brand">
          <div className="shell__brandMark">TA</div>
          {!collapsed ? (
            <div className="shell__brandCopy">
              <small>Operations Console</small>
              <strong>Tiny Admin</strong>
            </div>
          ) : null}
          <Button
            className="shell__collapseBtn"
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
        </div>

        <div className="shell__nav">
          <button
            className={clsx('shell__dashboardEntry', location.pathname === '/' && 'is-active')}
            onClick={() => navigate('/')}
            title="工作台"
          >
            <span className="shell__dashboardIcon">
              <HomeOutlined />
            </span>
            {!collapsed ? (
              <span className="shell__dashboardCopy">
                <strong>工作台</strong>
                <small>总览指标与快捷入口</small>
              </span>
            ) : null}
          </button>

          <div className="shell__menuStack">
            {categories.map((category) => {
              const expanded = !collapsed && expandedCategoryId === category.id
              const active = activeCategory?.id === category.id

              return (
                <div key={category.id} className={clsx('shell__menuGroup', expanded && 'is-expanded', active && 'is-active')}>
                  <button
                    className={clsx('shell__groupTrigger', expanded && 'is-expanded', active && 'is-active')}
                    onClick={() => {
                      if (collapsed) {
                        navigate(category.children?.[0]?.path || '/')
                        return
                      }
                      setExpandedCategoryId((current) => (current === category.id ? null : category.id))
                    }}
                    title={category.name}
                  >
                    <span className="shell__groupIcon">{iconMap[category.icon ?? 'DashboardOutlined'] ?? <DashboardOutlined />}</span>
                    {!collapsed ? (
                      <>
                        <span className="shell__groupCopy">
                          <strong>{category.name}</strong>
                          <small>{category.children?.length ?? 0} 个页面</small>
                        </span>
                        <RightOutlined className="shell__groupArrow" />
                      </>
                    ) : null}
                  </button>

                  {expanded && !collapsed ? (
                    <div className="shell__submenu">
                      {category.children?.map((child) => {
                        const childActive = location.pathname === child.path
                        return (
                          <button
                            key={child.id}
                            className={clsx('shell__submenuItem', childActive && 'is-active')}
                            onClick={() => navigate(child.path)}
                            title={child.name}
                          >
                            <span className="shell__submenuDot" />
                            <span className="shell__submenuLabel">{child.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      <Layout className="shell__stage">
        <Header className="shell__header">
          <div className="shell__headerLeft">
            <AutoComplete
              className="shell__search"
              options={searchOptions}
              value={globalSearch}
              onChange={setGlobalSearch}
              onSelect={(value) => {
                setGlobalSearch('')
                navigate(value)
              }}
            >
              <Input
                name="global-search"
                prefix={<SearchOutlined />}
                placeholder="搜索页面、命令、用户、参数配置"
                size="large"
                onPressEnter={() => {
                  const firstMatch = searchOptions[0]?.value
                  if (firstMatch) {
                    setGlobalSearch('')
                    navigate(String(firstMatch))
                  }
                }}
              />
            </AutoComplete>
            <Breadcrumb
              items={[
                { title: '平台后台' },
                ...(activeCategory ? [{ title: activeCategory.name }] : []),
                ...(location.pathname !== '/' ? [{ title: currentMenu?.name ?? '页面' }] : [{ title: '工作台' }]),
              ]}
            />
          </div>

          <div className="shell__headerRight">
            <div className="shell__status">
              <span className="shell__statusDot" />
              <span>核心服务运行正常</span>
            </div>
            <Tag color="cyan">{user.roles.join(' / ')}</Tag>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: '个人信息',
                    onClick: () => setProfileVisible(true),
                  },
                  {
                    key: 'password',
                    icon: <LockOutlined />,
                    label: '修改密码',
                    onClick: () => {
                      passwordForm.resetFields()
                      setPasswordVisible(true)
                    },
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => void logout().then(() => navigate('/login')),
                  },
                ],
              }}
            >
              <button className="shell__profile" type="button">
                <Avatar size={34}>{user.nickName[0]}</Avatar>
                <span className="shell__profileCopy">
                  <strong>{user.nickName}</strong>
                  <small>{user.deptName || '平台团队'}</small>
                </span>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content className="shell__content">
          <div className="shell__contentInner">{page}</div>
        </Content>
      </Layout>

      <Modal open={profileVisible} title="个人信息" footer={null} onCancel={() => setProfileVisible(false)} destroyOnHidden>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
          <Descriptions.Item label="显示名称">{user.nickName}</Descriptions.Item>
          <Descriptions.Item label="所属部门">{user.deptName || '未归属部门'}</Descriptions.Item>
          <Descriptions.Item label="角色">{user.roles.join(' / ')}</Descriptions.Item>
          <Descriptions.Item label="数据范围">{user.dataScope}</Descriptions.Item>
          <Descriptions.Item label="权限数量">{user.permissions.length}</Descriptions.Item>
        </Descriptions>
      </Modal>

      <Modal
        open={passwordVisible}
        title="修改密码"
        okText="保存密码"
        cancelText="取消"
        confirmLoading={savingPassword}
        destroyOnHidden
        onCancel={() => {
          setPasswordVisible(false)
          passwordForm.resetFields()
        }}
        onOk={() => void handlePasswordSubmit()}
      >
        <Form form={passwordForm} layout="vertical">
          <input
            aria-hidden="true"
            autoComplete="username"
            readOnly
            style={{ display: 'none' }}
            tabIndex={-1}
            value={user.username}
          />
          <Form.Item label="当前密码" name="oldPassword" rules={[{ required: true, message: '请输入当前密码' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '新密码至少 6 位' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="确认新密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入新密码' }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
