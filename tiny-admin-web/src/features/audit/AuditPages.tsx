import { Tag } from 'antd'
import { auditApi } from '../../shared/api/services'
import { ResourcePage } from '../../shared/components/ResourcePage'

function loginStatusLabel(value: string) {
  if (value === 'SUCCESS') {
    return '成功'
  }
  if (value === 'FAIL') {
    return '失败'
  }
  return value
}

export function AuditOperLogsPage() {
  return (
    <ResourcePage
      title="操作日志"
      description="记录系统关键操作的来源、操作者和请求摘要，便于排查变更链路。"
      load={auditApi.operLogs}
      save={async () => Promise.resolve({})}
      search={{
        placeholder: '搜索模块、动作、操作人或请求路径',
      }}
      filters={[
        {
          key: 'success',
          placeholder: '执行结果',
          width: 140,
          options: [
            { label: '成功', value: 1 },
            { label: '失败', value: 0 },
          ],
        },
      ]}
      columns={[
        { title: '模块', dataIndex: 'module', width: 140 },
        { title: '动作', dataIndex: 'action', width: 160 },
        { title: '操作人', dataIndex: 'operatorName', width: 140 },
        { title: '请求路径', dataIndex: 'requestUri', ellipsis: true },
        {
          title: '执行结果',
          dataIndex: 'success',
          width: 120,
          render: (value: number) => <Tag color={value === 1 ? 'success' : 'error'}>{value === 1 ? '成功' : '失败'}</Tag>,
        },
        { title: '时间', dataIndex: 'createdAt', width: 200 },
      ]}
      fields={[]}
    />
  )
}

export function AuditLoginLogsPage() {
  return (
    <ResourcePage
      title="登录日志"
      description="审查登录成功、失败和认证异常，快速确认账号安全状态。"
      load={auditApi.loginLogs}
      save={async () => Promise.resolve({})}
      search={{
        placeholder: '搜索用户名、IP 或失败原因',
      }}
      filters={[
        {
          key: 'status',
          placeholder: '登录结果',
          width: 140,
          options: [
            { label: '成功', value: 'SUCCESS' },
            { label: '失败', value: 'FAIL' },
          ],
        },
      ]}
      columns={[
        { title: '用户名', dataIndex: 'username', width: 160 },
        { title: 'IP', dataIndex: 'ip', width: 160 },
        {
          title: '状态',
          dataIndex: 'status',
          width: 120,
          render: (value: string) => <Tag color={value === 'SUCCESS' ? 'success' : 'error'}>{loginStatusLabel(value)}</Tag>,
        },
        { title: '消息', dataIndex: 'message', ellipsis: true },
        { title: '时间', dataIndex: 'createdAt', width: 200 },
      ]}
      fields={[]}
    />
  )
}
