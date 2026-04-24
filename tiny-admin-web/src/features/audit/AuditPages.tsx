import { ResourcePage } from '../../shared/components/ResourcePage'
import { auditApi } from '../../shared/api/services'

export function AuditOperLogsPage() {
  return (
    <ResourcePage
      title="操作日志"
      description="记录系统关键操作的调用来源、操作者和请求体摘要。"
      load={auditApi.operLogs}
      save={async () => Promise.resolve({})}
      columns={[
        { title: '模块', dataIndex: 'module' },
        { title: '动作', dataIndex: 'action' },
        { title: '操作者', dataIndex: 'operatorName' },
        { title: '请求路径', dataIndex: 'requestUri' },
        { title: '执行结果', dataIndex: 'success' },
        { title: '时间', dataIndex: 'createdAt' },
      ]}
      fields={[]}
    />
  )
}

export function AuditLoginLogsPage() {
  return (
    <ResourcePage
      title="登录日志"
      description="审查登录成功、失败和认证异常。"
      load={auditApi.loginLogs}
      save={async () => Promise.resolve({})}
      columns={[
        { title: '用户名', dataIndex: 'username' },
        { title: 'IP', dataIndex: 'ip' },
        { title: '状态', dataIndex: 'status' },
        { title: '消息', dataIndex: 'message' },
        { title: '时间', dataIndex: 'createdAt' },
      ]}
      fields={[]}
    />
  )
}
