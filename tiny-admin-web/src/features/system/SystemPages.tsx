import {
  ApartmentOutlined,
  BookOutlined,
  ControlOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tree,
  TreeSelect,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import {
  type DeptRecord,
  type DictTypeRecord,
  type MenuRecord,
  type RoleRecord,
  type SystemMeta,
  type UserRecord,
  systemApi,
} from '../../shared/api/services'
import { ResourcePage, statusTag } from '../../shared/components/ResourcePage'
import {
  buildTreeTable,
  collectSelfAndDescendantIds,
  dataScopeLabel,
  dataScopeOptions,
  deptTreeSelectData,
  menuCheckTreeData,
  menuTreeSelectData,
  menuTypeLabel,
  menuTypeOptions,
  noticeTypeOptions,
  postSelectOptions,
  roleSelectOptions,
  statusLabel,
  statusOptions,
  yesNoOptions,
} from './systemHelpers'

function useSystemMeta() {
  const { message } = App.useApp()
  const [meta, setMeta] = useState<SystemMeta | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshMeta = async () => {
    setLoading(true)
    try {
      const response = await systemApi.meta()
      setMeta(response.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载系统元数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshMeta()
  }, [])

  return { meta, loading, refreshMeta }
}

function WorkspaceHeader({
  title,
  description,
  metrics,
  extra,
}: {
  title: string
  description: string
  metrics: Array<{ label: string; value: number | string; icon?: React.ReactNode }>
  extra?: React.ReactNode
}) {
  return (
    <Card className="workspace-card">
      <div className="workspace-card__hero">
        <div>
          <Typography.Text className="eyebrow">系统管理工作区</Typography.Text>
          <Typography.Title level={3}>{title}</Typography.Title>
          <Typography.Paragraph>{description}</Typography.Paragraph>
        </div>
        <Space>{extra}</Space>
      </div>
      <div className="workspace-metrics">
        {metrics.map((item) => (
          <div className="workspace-metric" key={item.label}>
            <Statistic title={item.label} value={item.value} prefix={item.icon} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function parentMenuHelperText(menuType?: string, parentName?: string | null) {
  if (!menuType) {
    return '先选菜单类型，再决定放到哪个层级。'
  }
  if (!parentName) {
    return menuType === 'CATALOG' ? '当前会作为一级模块显示在侧边栏。' : '当前会放在最外层，请确认是否符合导航层级。'
  }
  if (menuType === 'BUTTON') {
    return `当前会挂到「${parentName}」下，作为按钮权限点管理。`
  }
  return `当前会挂到「${parentName}」下，成为可访问页面或目录。`
}

export function SystemUsersPage() {
  const { message } = App.useApp()
  const { meta, loading: metaLoading, refreshMeta } = useSystemMeta()
  const [rows, setRows] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>()
  const [deptId, setDeptId] = useState<number | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<UserRecord | null>(null)
  const [form] = Form.useForm()

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await systemApi.users()
      setRows(response.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载用户失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const roleMap = useMemo(() => new Map(meta?.roleOptions.map((item) => [item.value, item.label]) ?? []), [meta?.roleOptions])
  const deptFilterIds = useMemo(() => collectSelfAndDescendantIds(meta?.deptOptions ?? [], deptId), [deptId, meta?.deptOptions])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesKeyword =
        !keyword ||
        [row.username, row.nickName, row.email, row.phone, row.deptName, row.postName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword.toLowerCase()))
      const matchesStatus = status === undefined || row.status === status
      const matchesDept = deptId === undefined || deptFilterIds.has(row.deptId ?? -1)
      return matchesKeyword && matchesStatus && matchesDept
    })
  }, [deptFilterIds, deptId, keyword, rows, status])

  const handleCreate = () => {
    setCurrent(null)
    form.resetFields()
    form.setFieldsValue({ status: 1, dataScope: 'ALL', roleIds: meta?.roleOptions?.[0] ? [meta.roleOptions[0].value] : [] })
    setDrawerOpen(true)
  }

  const handleEdit = (record: UserRecord) => {
    setCurrent(record)
    form.resetFields()
    form.setFieldsValue({ ...record, roleIds: record.roleIds })
    setDrawerOpen(true)
  }

  const columns: ColumnsType<UserRecord> = [
    {
      title: '账号信息',
      key: 'profile',
      render: (_, record) => (
        <div className="cell-stack">
          <strong>{record.nickName}</strong>
          <span>{record.username}</span>
        </div>
      ),
    },
    {
      title: '组织与岗位',
      key: 'org',
      render: (_, record) => (
        <div className="cell-stack">
          <strong>{record.deptName || '未归属部门'}</strong>
          <span>{record.postName || '未绑定岗位'}</span>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roleIds',
      render: (value: number[]) => (
        <Space wrap>
          {value?.length ? value.map((roleId) => <Tag key={roleId}>{roleMap.get(roleId) ?? `角色 ${roleId}`}</Tag>) : <Tag>未分配</Tag>}
        </Space>
      ),
    },
    {
      title: '数据范围',
      dataIndex: 'dataScope',
      render: (value: string) => <Tag color="cyan">{dataScopeLabel(value)}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: number) => statusTag(statusLabel(value)),
    },
    {
      title: '操作',
      key: 'action',
      width: 170,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户？"
            description="该操作会同时移除角色绑定。"
            onConfirm={async () => {
              await systemApi.deleteUser(record.id)
              message.success('用户已删除')
              await loadUsers()
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <WorkspaceHeader
        title="用户管理"
        description="把账号、组织归属、角色授权和数据范围放在同一个工作区里完成，避免来回切页。"
        metrics={[
          { label: '用户总数', value: rows.length, icon: <UserOutlined /> },
          { label: '启用账号', value: rows.filter((item) => item.status === 1).length, icon: <UserOutlined /> },
          { label: '部门覆盖', value: new Set(rows.map((item) => item.deptId).filter(Boolean)).size, icon: <ApartmentOutlined /> },
        ]}
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => void Promise.all([loadUsers(), refreshMeta()])}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} loading={metaLoading}>
              新建用户
            </Button>
          </>
        }
      />

      <Card className="workspace-card">
        <div className="workspace-toolbar workspace-toolbar--stack">
          <Input name="user-search" placeholder="搜索账号、姓名、部门或邮箱" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="workspace-search" />
          <Space wrap>
            <Select allowClear placeholder="状态" options={statusOptions} value={status} onChange={setStatus} style={{ width: 140 }} />
            <TreeSelect
              allowClear
              placeholder="部门"
              treeData={deptTreeSelectData(meta?.deptOptions ?? [])}
              value={deptId}
              onChange={(value) => setDeptId(value as number | undefined)}
              style={{ width: 220 }}
              treeDefaultExpandAll
            />
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={loading || metaLoading}
          dataSource={filteredRows}
          columns={columns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          className="workspace-table"
        />
      </Card>

      <Drawer
        title={current ? `编辑用户 · ${current.nickName}` : '新建用户'}
        open={drawerOpen}
        size={560}
        destroyOnHidden
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={async () => {
                const values = await form.validateFields()
                await systemApi.saveUser({ ...current, ...values })
                message.success('用户已保存')
                setDrawerOpen(false)
                await loadUsers()
              }}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="显示名称" name="nickName" rules={[{ required: true, message: '请输入显示名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label={current ? '重置密码' : '登录密码'} name="password">
            <Input.Password placeholder={current ? '不填写则保持原密码' : '默认可填写为 admin123'} />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="归属部门" name="deptId">
            <TreeSelect treeData={deptTreeSelectData(meta?.deptOptions ?? [])} treeDefaultExpandAll allowClear />
          </Form.Item>
          <Form.Item label="岗位" name="postId">
            <Select allowClear options={postSelectOptions(meta?.postOptions ?? [])} />
          </Form.Item>
          <Form.Item label="角色" name="roleIds" rules={[{ required: true, message: '请至少选择一个角色' }]}>
            <Select mode="multiple" options={roleSelectOptions(meta?.roleOptions ?? [])} />
          </Form.Item>
          <Form.Item label="数据范围" name="dataScope" rules={[{ required: true, message: '请选择数据范围' }]}>
            <Select options={dataScopeOptions} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  )
}

export function SystemRolesPage() {
  const { message } = App.useApp()
  const { meta, loading: metaLoading, refreshMeta } = useSystemMeta()
  const [rows, setRows] = useState<RoleRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [roleStatus, setRoleStatus] = useState<number | undefined>()
  const [roleDataScope, setRoleDataScope] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<RoleRecord | null>(null)
  const [checkedMenuIds, setCheckedMenuIds] = useState<Array<number | string>>([])
  const [form] = Form.useForm()

  const loadRoles = async () => {
    setLoading(true)
    try {
      const response = await systemApi.roles()
      setRows(response.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载角色失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRoles()
  }, [])

  const menuCount = meta?.menuOptions?.filter((item) => item.type !== 'BUTTON').length ?? 0
  const filteredRows = useMemo(
    () =>
      rows.filter((item) => {
        const matchesKeyword =
          !keyword || [item.name, item.code, item.remark].some((value) => String(value ?? '').toLowerCase().includes(keyword.toLowerCase()))
        const matchesStatus = roleStatus === undefined || item.status === roleStatus
        const matchesDataScope = roleDataScope === undefined || item.dataScope === roleDataScope
        return matchesKeyword && matchesStatus && matchesDataScope
      }),
    [keyword, roleDataScope, roleStatus, rows],
  )

  const openDrawer = (record?: RoleRecord) => {
    setCurrent(record ?? null)
    form.resetFields()
    if (record) {
      form.setFieldsValue(record)
      setCheckedMenuIds(record.menuIds)
    } else {
      form.setFieldsValue({ status: 1, dataScope: 'ALL' })
      setCheckedMenuIds([])
    }
    setDrawerOpen(true)
  }

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <WorkspaceHeader
        title="角色管理"
        description="角色页直接处理数据范围和菜单授权，保存后即可反馈到导航和按钮权限。"
        metrics={[
          { label: '角色数量', value: rows.length, icon: <TeamOutlined /> },
          { label: '启用角色', value: rows.filter((item) => item.status === 1).length, icon: <TeamOutlined /> },
          { label: '可授权菜单', value: menuCount, icon: <BookOutlined /> },
        ]}
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => void Promise.all([loadRoles(), refreshMeta()])}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()} loading={metaLoading}>
              新建角色
            </Button>
          </>
        }
      />

      <Card className="workspace-card">
        <div className="workspace-toolbar workspace-toolbar--stack">
          <Input name="role-search" placeholder="搜索角色名称、编码或备注" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="workspace-search" />
          <Space wrap>
            <Select allowClear placeholder="数据范围" options={dataScopeOptions} value={roleDataScope} onChange={setRoleDataScope} style={{ width: 180 }} />
            <Select allowClear placeholder="状态" options={statusOptions} value={roleStatus} onChange={setRoleStatus} style={{ width: 140 }} />
          </Space>
        </div>
        <Table
          rowKey="id"
          loading={loading || metaLoading}
          dataSource={filteredRows}
          columns={[
            { title: '角色名称', dataIndex: 'name' },
            { title: '角色编码', dataIndex: 'code' },
            { title: '数据范围', dataIndex: 'dataScope', render: (value: string) => <Tag color="cyan">{dataScopeLabel(value)}</Tag> },
            { title: '菜单授权', dataIndex: 'menuIds', render: (value: number[]) => <Tag>{value.length} 项</Tag> },
            { title: '状态', dataIndex: 'status', render: (value: number) => statusTag(statusLabel(value)) },
            { title: '备注', dataIndex: 'remark', ellipsis: true },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Space size={4}>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认删除该角色？"
                    description="角色删除后会移除对应用户授权。"
                    onConfirm={async () => {
                      await systemApi.deleteRole(record.id)
                      message.success('角色已删除')
                      await loadRoles()
                    }}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          className="workspace-table"
        />
      </Card>

      <Drawer
        title={current ? `编辑角色 · ${current.name}` : '新建角色'}
        open={drawerOpen}
        size={720}
        destroyOnHidden
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={async () => {
                const values = await form.validateFields()
                await systemApi.saveRole({ ...current, ...values, menuIds: checkedMenuIds.map((item) => Number(item)) })
                message.success('角色已保存')
                setDrawerOpen(false)
                await loadRoles()
              }}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色编码" name="code" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="数据范围" name="dataScope" rules={[{ required: true, message: '请选择数据范围' }]}>
            <Select options={dataScopeOptions} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="菜单授权">
            <div className="tree-card">
              <Tree
                checkable
                defaultExpandAll
                checkedKeys={checkedMenuIds}
                treeData={menuCheckTreeData(meta?.menuTree ?? [])}
                onCheck={(keys) => setCheckedMenuIds(keys as Array<number | string>)}
              />
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  )
}

export function SystemMenusPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<MenuRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<MenuRecord | null>(null)
  const [form] = Form.useForm()

  const loadMenus = async () => {
    setLoading(true)
    try {
      const response = await systemApi.menus()
      setRows(response.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载菜单失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMenus()
  }, [])

  const menuMap = useMemo(() => new Map(rows.map((item) => [item.id, item])), [rows])
  const treeRows = useMemo(() => buildTreeTable(rows), [rows])
  const currentBranchIds = useMemo(() => collectSelfAndDescendantIds(rows, current?.id), [current?.id, rows])
  const parentDisabledIds = useMemo(() => new Set(rows.filter((item) => item.type === 'BUTTON').map((item) => item.id)), [rows])
  const parentIdValue = Form.useWatch('parentId', form)
  const menuTypeValue = Form.useWatch('type', form)
  const parentMenu = useMemo(
    () => (typeof parentIdValue === 'number' && parentIdValue > 0 ? menuMap.get(parentIdValue) ?? null : null),
    [menuMap, parentIdValue],
  )

  const filteredTree = useMemo(() => {
    if (!keyword) {
      return treeRows
    }
    const query = keyword.toLowerCase()
    const includesQuery = (item: MenuRecord & { children?: MenuRecord[] }): boolean => {
      const selfMatch = [item.name, item.path, item.permissionCode].some((value) => String(value ?? '').toLowerCase().includes(query))
      const childMatch = item.children?.some((child) => includesQuery(child as MenuRecord & { children?: MenuRecord[] })) ?? false
      return selfMatch || childMatch
    }
    return treeRows.filter((item) => includesQuery(item as MenuRecord & { children?: MenuRecord[] }))
  }, [keyword, treeRows])

  const openDrawer = (record?: MenuRecord, parentId?: number) => {
    setCurrent(record ?? null)
    form.resetFields()
    if (record) {
      form.setFieldsValue(record)
    } else {
      const parent = parentId ? menuMap.get(parentId) : undefined
      const defaultType = !parent ? 'CATALOG' : parent.type === 'MENU' ? 'BUTTON' : 'MENU'
      form.setFieldsValue({ parentId: parentId ?? 0, type: defaultType, orderNum: 1, status: 1, visible: 1 })
    }
    setDrawerOpen(true)
  }

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <WorkspaceHeader
        title="菜单管理"
        description="一级模块、二级页面和按钮权限统一在这里维护，支持直接添加子节点，避免手动记上级 ID。"
        metrics={[
          { label: '菜单总数', value: rows.length, icon: <BookOutlined /> },
          { label: '目录节点', value: rows.filter((item) => item.type === 'CATALOG').length, icon: <BookOutlined /> },
          { label: '按钮权限', value: rows.filter((item) => item.type === 'BUTTON').length, icon: <ControlOutlined /> },
        ]}
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => void loadMenus()}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
              新建一级菜单
            </Button>
          </>
        }
      />

      <Card className="workspace-card">
        <div className="workspace-toolbar">
          <Input name="menu-search" placeholder="搜索菜单名称、路由或权限标识" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="workspace-search" />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredTree}
          pagination={false}
          columns={[
            {
              title: '菜单名称',
              dataIndex: 'name',
              render: (value: string, record: MenuRecord) => (
                <Space>
                  <strong>{value}</strong>
                  <Tag color={record.type === 'CATALOG' ? 'processing' : record.type === 'MENU' ? 'cyan' : 'purple'}>
                    {menuTypeLabel(record.type)}
                  </Tag>
                </Space>
              ),
            },
            { title: '路由', dataIndex: 'path', render: (value?: string) => value || '-' },
            { title: '组件', dataIndex: 'component', render: (value?: string) => value || '-' },
            { title: '上级', render: (_, record) => (record.parentId ? menuMap.get(record.parentId)?.name ?? '-' : '一级节点') },
            { title: '权限标识', dataIndex: 'permissionCode', render: (value?: string) => value || '-' },
            { title: '排序', dataIndex: 'orderNum', width: 90 },
            { title: '状态', dataIndex: 'status', width: 90, render: (value: number) => statusTag(statusLabel(value)) },
            {
              title: '操作',
              key: 'action',
              width: 240,
              render: (_, record) => (
                <Space size={2} wrap>
                  {record.type !== 'BUTTON' ? (
                    <Button type="link" icon={<PlusOutlined />} onClick={() => openDrawer(undefined, record.id)}>
                      加子级
                    </Button>
                  ) : null}
                  <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认删除该菜单？"
                    description="存在子节点时服务端会阻止删除。"
                    onConfirm={async () => {
                      await systemApi.deleteMenu(record.id)
                      message.success('菜单已删除')
                      await loadMenus()
                    }}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          className="workspace-table"
        />
      </Card>

      <Drawer
        title={current ? `编辑菜单 · ${current.name}` : '新建菜单'}
        open={drawerOpen}
        size={620}
        destroyOnHidden
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={async () => {
                const values = await form.validateFields()
                await systemApi.saveMenu({ ...current, ...values })
                message.success('菜单已保存')
                setDrawerOpen(false)
                await loadMenus()
              }}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={current ? '正在调整已有菜单结构' : '建议先确定层级，再补路由与权限'}
            description={parentMenuHelperText(menuTypeValue, parentMenu?.name ?? null)}
          />

          <Form form={form} layout="vertical">
            <Form.Item label="上级节点" name="parentId" rules={[{ required: true, message: '请选择上级节点' }]}>
              <TreeSelect
                treeData={menuTreeSelectData(rows, {
                  rootTitle: '作为一级模块',
                  excludeIds: currentBranchIds,
                  disabledIds: parentDisabledIds,
                })}
                treeDefaultExpandAll
              />
            </Form.Item>
            <Form.Item label="菜单名称" name="name" rules={[{ required: true, message: '请输入菜单名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="菜单类型" name="type" rules={[{ required: true, message: '请选择菜单类型' }]}>
              <Select options={menuTypeOptions} />
            </Form.Item>

            {menuTypeValue !== 'BUTTON' ? (
              <Form.Item label="路由地址" name="path">
                <Input placeholder={menuTypeValue === 'CATALOG' ? '/system' : '/system/users'} />
              </Form.Item>
            ) : null}

            {menuTypeValue === 'MENU' ? (
              <Form.Item label="组件路径" name="component">
                <Input placeholder="/system/users" />
              </Form.Item>
            ) : null}

            {menuTypeValue !== 'BUTTON' ? (
              <Form.Item label="图标标识" name="icon">
                <Input placeholder="UserOutlined" />
              </Form.Item>
            ) : null}

            {menuTypeValue !== 'CATALOG' ? (
              <Form.Item label="权限标识" name="permissionCode">
                <Input placeholder={menuTypeValue === 'BUTTON' ? 'system:user:add' : 'system:user:list'} />
              </Form.Item>
            ) : null}

            <Form.Item label="排序" name="orderNum" rules={[{ required: true, message: '请输入排序值' }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="显示状态" name="visible" rules={[{ required: true, message: '请选择显示状态' }]}>
              <Select options={yesNoOptions} />
            </Form.Item>
            <Form.Item label="启用状态" name="status" rules={[{ required: true, message: '请选择启用状态' }]}>
              <Select options={statusOptions} />
            </Form.Item>
          </Form>
        </Space>
      </Drawer>
    </Space>
  )
}

export function SystemDeptsPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<DeptRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<DeptRecord | null>(null)
  const [form] = Form.useForm()

  const loadDepts = async () => {
    setLoading(true)
    try {
      const response = await systemApi.depts()
      setRows(response.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载部门失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDepts()
  }, [])

  const deptMap = useMemo(() => new Map(rows.map((item) => [item.id, item])), [rows])
  const treeRows = useMemo(() => buildTreeTable(rows), [rows])
  const currentBranchIds = useMemo(() => collectSelfAndDescendantIds(rows, current?.id), [current?.id, rows])
  const parentIdValue = Form.useWatch('parentId', form)
  const parentDept = useMemo(
    () => (typeof parentIdValue === 'number' && parentIdValue > 0 ? deptMap.get(parentIdValue) ?? null : null),
    [deptMap, parentIdValue],
  )

  const filteredTree = useMemo(() => {
    if (!keyword) {
      return treeRows
    }
    const query = keyword.toLowerCase()
    const includesQuery = (item: DeptRecord & { children?: DeptRecord[] }): boolean => {
      const selfMatch = [item.name, item.leader, item.phone, item.email].some((value) => String(value ?? '').toLowerCase().includes(query))
      const childMatch = item.children?.some((child) => includesQuery(child as DeptRecord & { children?: DeptRecord[] })) ?? false
      return selfMatch || childMatch
    }
    return treeRows.filter((item) => includesQuery(item as DeptRecord & { children?: DeptRecord[] }))
  }, [keyword, treeRows])

  const openDrawer = (record?: DeptRecord, parentId?: number) => {
    setCurrent(record ?? null)
    form.resetFields()
    if (record) {
      form.setFieldsValue(record)
    } else {
      form.setFieldsValue({ parentId: parentId ?? 0, orderNum: 1, status: 1 })
    }
    setDrawerOpen(true)
  }

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <WorkspaceHeader
        title="部门管理"
        description="部门页支持直接新增下级部门，并保留负责人、联系方式和排序，方便组织维护。"
        metrics={[
          { label: '部门总数', value: rows.length, icon: <ApartmentOutlined /> },
          { label: '一级部门', value: rows.filter((item) => item.parentId === 0).length, icon: <ApartmentOutlined /> },
          { label: '启用部门', value: rows.filter((item) => item.status === 1).length, icon: <ApartmentOutlined /> },
        ]}
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => void loadDepts()}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
              新建一级部门
            </Button>
          </>
        }
      />

      <Card className="workspace-card">
        <div className="workspace-toolbar">
          <Input name="dept-search" placeholder="搜索部门名称、负责人或联系方式" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="workspace-search" />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredTree}
          pagination={false}
          columns={[
            { title: '部门名称', dataIndex: 'name' },
            { title: '上级部门', render: (_, record) => (record.parentId ? deptMap.get(record.parentId)?.name ?? '-' : '一级部门') },
            { title: '负责人', dataIndex: 'leader', render: (value?: string) => value || '-' },
            { title: '联系电话', dataIndex: 'phone', render: (value?: string) => value || '-' },
            { title: '邮箱', dataIndex: 'email', render: (value?: string) => value || '-' },
            { title: '排序', dataIndex: 'orderNum', width: 90 },
            { title: '状态', dataIndex: 'status', width: 90, render: (value: number) => statusTag(statusLabel(value)) },
            {
              title: '操作',
              key: 'action',
              width: 240,
              render: (_, record) => (
                <Space size={2} wrap>
                  <Button type="link" icon={<PlusOutlined />} onClick={() => openDrawer(undefined, record.id)}>
                    加下级
                  </Button>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认删除该部门？"
                    description="存在下级或绑定用户时服务端会阻止删除。"
                    onConfirm={async () => {
                      await systemApi.deleteDept(record.id)
                      message.success('部门已删除')
                      await loadDepts()
                    }}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          className="workspace-table"
        />
      </Card>

      <Drawer
        title={current ? `编辑部门 · ${current.name}` : '新建部门'}
        open={drawerOpen}
        size={580}
        destroyOnHidden
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={async () => {
                const values = await form.validateFields()
                await systemApi.saveDept({ ...current, ...values })
                message.success('部门已保存')
                setDrawerOpen(false)
                await loadDepts()
              }}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={current ? '调整部门层级时会同步影响用户归属理解' : '建议先确定组织层级，再补负责人和联系方式'}
            description={parentDept ? `当前会挂在「${parentDept.name}」下。` : '当前会作为一级部门显示。'}
          />

          <Form form={form} layout="vertical">
            <Form.Item label="上级部门" name="parentId" rules={[{ required: true, message: '请选择上级部门' }]}>
              <TreeSelect
                treeData={deptTreeSelectData(rows, {
                  rootTitle: '作为一级部门',
                  excludeIds: currentBranchIds,
                })}
                treeDefaultExpandAll
              />
            </Form.Item>
            <Form.Item label="部门名称" name="name" rules={[{ required: true, message: '请输入部门名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="负责人" name="leader">
              <Input />
            </Form.Item>
            <Form.Item label="联系电话" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
              <Input />
            </Form.Item>
            <Form.Item label="排序" name="orderNum" rules={[{ required: true, message: '请输入排序值' }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
              <Select options={statusOptions} />
            </Form.Item>
          </Form>
        </Space>
      </Drawer>
    </Space>
  )
}

export function SystemPostsPage() {
  return (
    <ResourcePage
      title="岗位管理"
      description="岗位用于承接人员职责，和用户页联动后就能直接分配。"
      load={systemApi.posts}
      save={systemApi.savePost}
      remove={systemApi.deletePost}
      search={{
        placeholder: '搜索岗位名称、编码或备注',
        fields: ['name', 'code', 'remark'],
      }}
      filters={[
        {
          key: 'status',
          placeholder: '岗位状态',
          width: 140,
          options: statusOptions,
        },
      ]}
      columns={[
        { title: '岗位名称', dataIndex: 'name' },
        { title: '岗位编码', dataIndex: 'code' },
        { title: '排序', dataIndex: 'orderNum' },
        { title: '状态', dataIndex: 'status', render: (value: number) => statusTag(statusLabel(value)) },
        { title: '备注', dataIndex: 'remark', ellipsis: true },
      ]}
      fields={[
        { name: 'name', label: '岗位名称', required: true },
        { name: 'code', label: '岗位编码', required: true },
        { name: 'orderNum', label: '排序', type: 'number', required: true },
        { name: 'status', label: '状态', type: 'select', options: statusOptions, required: true },
        { name: 'remark', label: '备注', type: 'textarea' },
      ]}
      defaultValues={{ orderNum: 1, status: 1 }}
    />
  )
}

export function SystemDictsPage() {
  const [dictTypes, setDictTypes] = useState<DictTypeRecord[]>([])

  useEffect(() => {
    void systemApi.dictTypes().then((response) => setDictTypes(response.data))
  }, [])

  return (
    <Tabs
      items={[
        {
          key: 'types',
          label: '字典类型',
          children: (
            <ResourcePage
              title="字典类型"
              description="统一维护字典分类，供状态标签、筛选项和表单下拉复用。"
              load={systemApi.dictTypes}
              save={systemApi.saveDictType}
              remove={systemApi.deleteDictType}
              search={{
                placeholder: '搜索字典名称、编码或备注',
                fields: ['name', 'typeCode', 'remark'],
              }}
              filters={[
                {
                  key: 'status',
                  placeholder: '状态',
                  width: 140,
                  options: statusOptions,
                },
              ]}
              columns={[
                { title: '名称', dataIndex: 'name' },
                { title: '编码', dataIndex: 'typeCode' },
                { title: '状态', dataIndex: 'status', render: (value: number) => statusTag(statusLabel(value)) },
                { title: '备注', dataIndex: 'remark', ellipsis: true },
              ]}
              fields={[
                { name: 'name', label: '名称', required: true },
                { name: 'typeCode', label: '编码', required: true },
                { name: 'status', label: '状态', type: 'select', options: statusOptions, required: true },
                { name: 'remark', label: '备注', type: 'textarea' },
              ]}
              defaultValues={{ status: 1 }}
            />
          ),
        },
        {
          key: 'data',
          label: '字典数据',
          children: (
            <ResourcePage
              title="字典数据"
              description="字典项可配置标签样式和排序，适合前端状态展示。"
              load={systemApi.dictData}
              save={systemApi.saveDictData}
              remove={systemApi.deleteDictData}
              search={{
                placeholder: '搜索标签、值或 Tag 类型',
                fields: ['label', 'value', 'tagType', (row) => dictTypes.find((item) => item.id === row.typeId)?.name],
              }}
              filters={[
                {
                  key: 'typeId',
                  placeholder: '字典类型',
                  width: 180,
                  options: dictTypes.map((item) => ({ label: item.name, value: item.id })),
                },
                {
                  key: 'status',
                  placeholder: '状态',
                  width: 140,
                  options: statusOptions,
                },
              ]}
              columns={[
                {
                  title: '类型',
                  dataIndex: 'typeId',
                  render: (value: number) => dictTypes.find((item) => item.id === value)?.name ?? `类型 ${value}`,
                },
                { title: '标签', dataIndex: 'label' },
                { title: '值', dataIndex: 'value' },
                { title: 'Tag 类型', dataIndex: 'tagType', render: (value?: string) => value || '-' },
                { title: '状态', dataIndex: 'status', render: (value: number) => statusTag(statusLabel(value)) },
              ]}
              fields={[
                {
                  name: 'typeId',
                  label: '字典类型',
                  type: 'select',
                  options: dictTypes.map((item) => ({ label: item.name, value: item.id })),
                  required: true,
                },
                { name: 'label', label: '标签', required: true },
                { name: 'value', label: '值', required: true },
                { name: 'tagType', label: 'Tag 类型' },
                { name: 'orderNum', label: '排序', type: 'number', required: true },
                { name: 'status', label: '状态', type: 'select', options: statusOptions, required: true },
              ]}
              defaultValues={{ orderNum: 1, status: 1 }}
            />
          ),
        },
      ]}
    />
  )
}

export function SystemConfigsPage() {
  return (
    <ResourcePage
      title="参数管理"
      description="系统参数集中维护，内置参数受保护，避免误删。"
      load={systemApi.configs}
      save={systemApi.saveConfig}
      remove={systemApi.deleteConfig}
      search={{
        placeholder: '搜索参数名称、Key 或参数值',
        fields: ['name', 'configKey', 'configValue', 'remark'],
      }}
      filters={[
        {
          key: 'builtin',
          placeholder: '参数属性',
          width: 160,
          options: [
            { label: '内置参数', value: 1 },
            { label: '普通参数', value: 0 },
          ],
        },
      ]}
      columns={[
        { title: '参数名称', dataIndex: 'name' },
        { title: '参数 Key', dataIndex: 'configKey' },
        { title: '参数值', dataIndex: 'configValue', ellipsis: true },
        { title: '内置', dataIndex: 'builtin', render: (value: number) => statusTag(value === 1 ? '是' : '否') },
      ]}
      fields={[
        { name: 'name', label: '参数名称', required: true },
        { name: 'configKey', label: '参数 Key', required: true },
        { name: 'configValue', label: '参数值', required: true },
        { name: 'builtin', label: '内置参数', type: 'select', options: yesNoOptions, required: true },
        { name: 'remark', label: '备注', type: 'textarea' },
      ]}
      defaultValues={{ builtin: 0 }}
    />
  )
}

export function SystemNoticesPage() {
  return (
    <ResourcePage
      title="通知公告"
      description="平台公告集中管理，适合发布全局提醒和维护通知。"
      load={systemApi.notices}
      save={systemApi.saveNotice}
      remove={systemApi.deleteNotice}
      search={{
        placeholder: '搜索公告标题或内容摘要',
        fields: ['title', 'content'],
      }}
      filters={[
        {
          key: 'type',
          placeholder: '公告类型',
          width: 160,
          options: noticeTypeOptions,
        },
        {
          key: 'status',
          placeholder: '状态',
          width: 140,
          options: statusOptions,
        },
      ]}
      columns={[
        { title: '标题', dataIndex: 'title' },
        { title: '类型', dataIndex: 'type', render: (value: string) => <Tag color="processing">{value}</Tag> },
        { title: '状态', dataIndex: 'status', render: (value: number) => statusTag(statusLabel(value)) },
        { title: '内容', dataIndex: 'content', ellipsis: true },
      ]}
      fields={[
        { name: 'title', label: '标题', required: true },
        { name: 'type', label: '类型', type: 'select', options: noticeTypeOptions, required: true },
        { name: 'status', label: '状态', type: 'select', options: statusOptions, required: true },
        { name: 'content', label: '内容', type: 'textarea', required: true },
      ]}
      defaultValues={{ type: 'INFO', status: 1 }}
    />
  )
}
