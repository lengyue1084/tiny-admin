import { ResourcePage, statusTag } from '../../shared/components/ResourcePage'
import { demoApi } from '../../shared/api/services'

const projectStatusOptions = [
  { label: '规划中', value: '规划中' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
]

export function DemoProjectsPage() {
  return (
    <ResourcePage
      title="示例项目"
      description="作为业务模块模板，验证菜单、权限、日志和标准 CRUD 的完整接入方式。"
      load={demoApi.projects}
      save={demoApi.saveProject}
      remove={demoApi.deleteProject}
      search={{
        placeholder: '搜索项目名称、负责人或描述',
        fields: ['name', 'owner', 'description'],
      }}
      filters={[
        {
          key: 'status',
          placeholder: '项目状态',
          width: 160,
          options: projectStatusOptions,
        },
      ]}
      columns={[
        { title: '项目名称', dataIndex: 'name' },
        { title: '负责人', dataIndex: 'owner' },
        { title: '状态', dataIndex: 'status', render: statusTag },
        { title: '描述', dataIndex: 'description', ellipsis: true },
      ]}
      fields={[
        { name: 'name', label: '项目名称', required: true },
        { name: 'owner', label: '负责人', required: true },
        {
          name: 'status',
          label: '状态',
          type: 'select',
          options: projectStatusOptions,
          required: true,
        },
        { name: 'description', label: '描述', type: 'textarea' },
      ]}
      defaultValues={{ status: '规划中' }}
    />
  )
}
