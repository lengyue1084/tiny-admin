import { App, Button, Card, Input, Select, Space, Table, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { ResourcePage } from '../../shared/components/ResourcePage'
import { schedulerApi } from '../../shared/api/services'

function useDebouncedValue(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value.trim()), delay)
    return () => window.clearTimeout(timer)
  }, [delay, value])

  return debouncedValue
}

export function SchedulerJobsPage() {
  const { message } = App.useApp()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <ResourcePage
      key={refreshKey}
      title="定时任务"
      description="支持新增、启停和手动执行后台任务，避免通过服务重启或整页刷新来维护作业。"
      load={schedulerApi.jobs}
      save={schedulerApi.saveJob}
      remove={schedulerApi.deleteJob}
      search={{
        placeholder: '搜索任务名称、分组、Bean 或方法',
      }}
      filters={[
        {
          key: 'status',
          placeholder: '任务状态',
          width: 140,
          options: [
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ],
        },
      ]}
      columns={[
        { title: '任务名称', dataIndex: 'name' },
        { title: '分组', dataIndex: 'jobGroup', width: 120 },
        { title: 'Cron', dataIndex: 'cronExpression', width: 180 },
        { title: 'Bean', dataIndex: 'targetBean', width: 160 },
        { title: '方法', dataIndex: 'targetMethod', width: 160 },
        {
          title: '状态',
          dataIndex: 'status',
          width: 120,
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
                  setRefreshKey((value) => value + 1)
                }}
              >
                立即执行
              </Button>
              <Button
                type="link"
                onClick={async () => {
                  await schedulerApi.updateJobStatus(record.id, record.status === 1 ? 0 : 1)
                  message.success('任务状态已更新')
                  setRefreshKey((value) => value + 1)
                }}
              >
                {record.status === 1 ? '停用' : '启用'}
              </Button>
            </Space>
          ),
        },
      ]}
      fields={[
        { name: 'name', label: '任务名称', required: true },
        { name: 'jobGroup', label: '分组', required: true },
        { name: 'cronExpression', label: 'Cron 表达式', required: true },
        { name: 'targetBean', label: 'Bean 名称', required: true },
        { name: 'targetMethod', label: '方法名', required: true },
        { name: 'args', label: '参数' },
        {
          name: 'status',
          label: '状态',
          type: 'select',
          options: [
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ],
          required: true,
        },
      ]}
      defaultValues={{ jobGroup: 'system', status: 1 }}
    />
  )
}

export function SchedulerLogsPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [success, setSuccess] = useState<number | undefined>()
  const debouncedKeyword = useDebouncedValue(keyword)

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await schedulerApi.logs({
        keyword: debouncedKeyword || undefined,
        success,
      })
      setRows(result.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载任务日志失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLogs()
  }, [debouncedKeyword, success])

  return (
    <Card className="workspace-card">
      <div className="workspace-card__hero">
        <div>
          <Typography.Text className="eyebrow">调度日志</Typography.Text>
          <Typography.Title level={3}>任务执行日志</Typography.Title>
          <Typography.Paragraph>查看最近的调度执行结果、消息和时间，用来快速确认任务链路是否正常。</Typography.Paragraph>
        </div>
        <div className="workspace-card__heroMeta">
          <div className="metric-chip">
            <span>当前结果</span>
            <strong>{rows.length}</strong>
          </div>
        </div>
      </div>

      <div className="workspace-toolbar workspace-toolbar--stack">
        <Input
          allowClear
          name="scheduler-log-search"
          placeholder="搜索任务名称或执行消息"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="workspace-search"
        />
        <Space wrap>
          <Select
            allowClear
            placeholder="执行结果"
            value={success}
            onChange={(value) => setSuccess(value as number | undefined)}
            options={[
              { label: '成功', value: 1 },
              { label: '失败', value: 0 },
            ]}
            style={{ width: 140 }}
          />
          <Button onClick={() => void loadLogs()}>刷新</Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: '任务名称', dataIndex: 'jobName', width: 200 },
          {
            title: '执行结果',
            dataIndex: 'success',
            width: 120,
            render: (value: number) => <Tag color={value === 1 ? 'success' : 'error'}>{value === 1 ? '成功' : '失败'}</Tag>,
          },
          { title: '消息', dataIndex: 'message', ellipsis: true },
          { title: '时间', dataIndex: 'createdAt', width: 200 },
        ]}
        className="workspace-table"
      />
    </Card>
  )
}
