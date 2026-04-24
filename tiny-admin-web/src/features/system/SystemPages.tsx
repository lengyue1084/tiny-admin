import { Tabs, Tag } from 'antd'
import { ResourcePage, statusTag } from '../../shared/components/ResourcePage'
import { systemApi } from '../../shared/api/services'

export function SystemUsersPage() {
  return (
    <ResourcePage
      title="用户管理"
      description="维护后台操作人员账号、归属部门、岗位和数据范围。"
      load={systemApi.users}
      save={systemApi.saveUser}
      remove={systemApi.deleteUser}
      columns={[
        { title: '用户名', dataIndex: 'username' },
        { title: '昵称', dataIndex: 'nickName' },
        { title: '邮箱', dataIndex: 'email' },
        { title: '手机号', dataIndex: 'phone' },
        { title: '数据范围', dataIndex: 'dataScope', render: (value: string) => <Tag color="blue">{value}</Tag> },
        { title: '状态', dataIndex: 'status', render: statusTag },
      ]}
      fields={[
        { name: 'username', label: '用户名', required: true },
        { name: 'password', label: '密码' },
        { name: 'nickName', label: '昵称', required: true },
        { name: 'email', label: '邮箱' },
        { name: 'phone', label: '手机号' },
        { name: 'deptId', label: '部门ID', type: 'number' },
        { name: 'postId', label: '岗位ID', type: 'number' },
        { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
        { name: 'dataScope', label: '数据范围', type: 'select', options: [{ label: '全部', value: 'ALL' }, { label: '本部门及以下', value: 'DEPT_AND_CHILD' }, { label: '仅本人', value: 'SELF' }], required: true },
      ]}
      defaultValues={{ status: 1, dataScope: 'ALL', roleIds: [1] }}
    />
  )
}

export function SystemRolesPage() {
  return (
    <ResourcePage
      title="角色管理"
      description="配置角色编码、菜单权限和数据范围，是平台授权体系的核心。"
      load={systemApi.roles}
      save={systemApi.saveRole}
      remove={systemApi.deleteRole}
      columns={[
        { title: '角色名', dataIndex: 'name' },
        { title: '编码', dataIndex: 'code' },
        { title: '数据范围', dataIndex: 'dataScope' },
        { title: '状态', dataIndex: 'status', render: statusTag },
        { title: '备注', dataIndex: 'remark' },
      ]}
      fields={[
        { name: 'name', label: '角色名', required: true },
        { name: 'code', label: '角色编码', required: true },
        { name: 'dataScope', label: '数据范围', type: 'select', options: [{ label: '全部', value: 'ALL' }, { label: '本部门', value: 'DEPT' }, { label: '仅本人', value: 'SELF' }], required: true },
        { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
        { name: 'remark', label: '备注', type: 'textarea' },
      ]}
      defaultValues={{ status: 1, dataScope: 'ALL', menuIds: [1, 2, 3] }}
    />
  )
}

export function SystemMenusPage() {
  return (
    <ResourcePage
      title="菜单管理"
      description="前端导航和按钮权限都由这里统一驱动。"
      load={systemApi.menus}
      save={systemApi.saveMenu}
      remove={systemApi.deleteMenu}
      columns={[
        { title: '名称', dataIndex: 'name' },
        { title: '路径', dataIndex: 'path' },
        { title: '类型', dataIndex: 'type' },
        { title: '权限标识', dataIndex: 'permissionCode' },
        { title: '排序', dataIndex: 'orderNum' },
      ]}
      fields={[
        { name: 'parentId', label: '父级菜单ID', type: 'number', required: true },
        { name: 'name', label: '名称', required: true },
        { name: 'path', label: '路径' },
        { name: 'component', label: '组件路径' },
        { name: 'icon', label: '图标' },
        { name: 'type', label: '类型', type: 'select', options: [{ label: '目录', value: 'CATALOG' }, { label: '菜单', value: 'MENU' }, { label: '按钮', value: 'BUTTON' }], required: true },
        { name: 'permissionCode', label: '权限标识' },
        { name: 'orderNum', label: '排序', type: 'number', required: true },
      ]}
      defaultValues={{ parentId: 0, type: 'MENU', orderNum: 1, visible: 1, status: 1 }}
    />
  )
}

export function SystemDeptsPage() {
  return (
    <ResourcePage
      title="部门管理"
      description="组织树支持角色数据范围和后续业务归属关系。"
      load={systemApi.depts}
      save={systemApi.saveDept}
      columns={[
        { title: '部门名称', dataIndex: 'name' },
        { title: '负责人', dataIndex: 'leader' },
        { title: '联系电话', dataIndex: 'phone' },
        { title: '邮箱', dataIndex: 'email' },
        { title: '状态', dataIndex: 'status', render: statusTag },
      ]}
      fields={[
        { name: 'parentId', label: '父级部门ID', type: 'number', required: true },
        { name: 'name', label: '部门名称', required: true },
        { name: 'leader', label: '负责人' },
        { name: 'phone', label: '联系电话' },
        { name: 'email', label: '邮箱' },
        { name: 'orderNum', label: '排序', type: 'number', required: true },
        { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
      ]}
      defaultValues={{ parentId: 0, orderNum: 1, status: 1 }}
    />
  )
}

export function SystemPostsPage() {
  return (
    <ResourcePage
      title="岗位管理"
      description="岗位用于承接人员职责和后续工作流扩展。"
      load={systemApi.posts}
      save={systemApi.savePost}
      columns={[
        { title: '岗位名称', dataIndex: 'name' },
        { title: '岗位编码', dataIndex: 'code' },
        { title: '排序', dataIndex: 'orderNum' },
        { title: '状态', dataIndex: 'status', render: statusTag },
      ]}
      fields={[
        { name: 'name', label: '岗位名称', required: true },
        { name: 'code', label: '岗位编码', required: true },
        { name: 'orderNum', label: '排序', type: 'number', required: true },
        { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
        { name: 'remark', label: '备注', type: 'textarea' },
      ]}
      defaultValues={{ orderNum: 1, status: 1 }}
    />
  )
}

export function SystemDictsPage() {
  return (
    <Tabs
      items={[
        {
          key: 'types',
          label: '字典类型',
          children: (
            <ResourcePage
              title="字典类型"
              description="维护字典的分类，为前端状态标签和下拉选项提供统一来源。"
              load={systemApi.dictTypes}
              save={systemApi.saveDictType}
              columns={[
                { title: '名称', dataIndex: 'name' },
                { title: '编码', dataIndex: 'typeCode' },
                { title: '状态', dataIndex: 'status', render: statusTag },
                { title: '备注', dataIndex: 'remark' },
              ]}
              fields={[
                { name: 'name', label: '名称', required: true },
                { name: 'typeCode', label: '编码', required: true },
                { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
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
              description="维护字典项值、标签样式和前端展示顺序。"
              load={systemApi.dictData}
              save={systemApi.saveDictData}
              columns={[
                { title: '类型ID', dataIndex: 'typeId' },
                { title: '标签', dataIndex: 'label' },
                { title: '值', dataIndex: 'value' },
                { title: 'Tag 类型', dataIndex: 'tagType' },
                { title: '状态', dataIndex: 'status', render: statusTag },
              ]}
              fields={[
                { name: 'typeId', label: '类型ID', type: 'number', required: true },
                { name: 'label', label: '标签', required: true },
                { name: 'value', label: '值', required: true },
                { name: 'tagType', label: 'Tag 类型' },
                { name: 'orderNum', label: '排序', type: 'number', required: true },
                { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
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
      description="系统运行时参数和主题参数都可以从这里统一维护。"
      load={systemApi.configs}
      save={systemApi.saveConfig}
      columns={[
        { title: '参数名称', dataIndex: 'name' },
        { title: 'Key', dataIndex: 'configKey' },
        { title: '值', dataIndex: 'configValue' },
        { title: '内置', dataIndex: 'builtin', render: (value: number) => statusTag(value) },
      ]}
      fields={[
        { name: 'name', label: '参数名称', required: true },
        { name: 'configKey', label: '参数 Key', required: true },
        { name: 'configValue', label: '参数值', required: true },
        { name: 'builtin', label: '内置', type: 'select', options: [{ label: '是', value: 1 }, { label: '否', value: 0 }], required: true },
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
      description="平台级公告内容统一在这里维护。"
      load={systemApi.notices}
      save={systemApi.saveNotice}
      columns={[
        { title: '标题', dataIndex: 'title' },
        { title: '类型', dataIndex: 'type' },
        { title: '状态', dataIndex: 'status', render: statusTag },
        { title: '内容', dataIndex: 'content', ellipsis: true },
      ]}
      fields={[
        { name: 'title', label: '标题', required: true },
        { name: 'type', label: '类型', type: 'select', options: [{ label: 'INFO', value: 'INFO' }, { label: 'WARN', value: 'WARN' }, { label: 'SUCCESS', value: 'SUCCESS' }], required: true },
        { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
        { name: 'content', label: '内容', type: 'textarea', required: true },
      ]}
      defaultValues={{ type: 'INFO', status: 1 }}
    />
  )
}
