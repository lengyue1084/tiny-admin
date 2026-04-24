import { Button, Card, Space, Table, Tag, message } from 'antd'
import { useEffect, useState } from 'react'
import { ResourcePage } from '../../shared/components/ResourcePage'
import { schedulerApi } from '../../shared/api/services'

export function SchedulerJobsPage() {
  return (
    <ResourcePage
      title="定时任务"
      description="新增、启停和手动执行后台任务。"
      load={schedulerApi.jobs}
      save={schedulerApi.saveJob}
      remove={schedulerApi.deleteJob}
      columns={[
        { title: '任务名', dataIndex: 'name' },
        { title: '分组', dataIndex: 'jobGroup' },
        { title: 'Cron', dataIndex: 'cronExpression' },
        { title: 'Bean', dataIndex: 'targetBean' },
        { title: '方法', dataIndex: 'targetMethod' },
        {
          title: '状态',
          dataIndex: 'status',
          render: (value: number) => <Tag color={value === 1 ? 'success' : 'default'}>{value === 1 ? '启用' : '停用'}</Tag>,
        },
        {
          title: '更多',
          key: 'extra',
          render: (_: unknown, record: { id: number; status: number }) => (
            <Space>
              <Button
                type="link"
                onClick={async () => {
                  await schedulerApi.triggerJob(record.id)
                  message.success('任务已触发')
                }}
              >
                立即执行
              </Button>
              <Button
                type="link"
                onClick={async () => {
                  await schedulerApi.updateJobStatus(record.id, record.status === 1 ? 0 : 1)
                  message.success('状态已更新')
                  window.location.reload()
                }}
              >
                {record.status === 1 ? '停用' : '启用'}
              </Button>
            </Space>
          ),
        },
      ]}
      fields={[
        { name: 'name', label: '任务名', required: true },
        { name: 'jobGroup', label: '分组', required: true },
        { name: 'cronExpression', label: 'Cron 表达式', required: true },
        { name: 'targetBean', label: 'Bean 名称', required: true },
        { name: 'targetMethod', label: '方法名', required: true },
        { name: 'args', label: '参数' },
        { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }], required: true },
      ]}
      defaultValues={{ jobGroup: 'system', status: 1 }}
    />
  )
}

export function SchedulerLogsPage() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    void schedulerApi.logs().then((result) => setRows(result.data))
  }, [])

  return (
    <Card className="page-card" title="任务执行日志">
      <Table
        rowKey="id"
        dataSource={rows}
        columns={[
          { title: '任务名称', dataIndex: 'jobName' },
          { title: '执行结果', dataIndex: 'success', render: (value: number) => <Tag color={value === 1 ? 'success' : 'error'}>{value === 1 ? '成功' : '失败'}</Tag> },
          { title: '消息', dataIndex: 'message' },
          { title: '时间', dataIndex: 'createdAt' },
        ]}
      />
    </Card>
  )
}
