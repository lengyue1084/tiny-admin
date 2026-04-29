import { DatabaseOutlined, DownloadOutlined, GlobalOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons'
import { App, Button, Card, Col, Descriptions, Input, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { monitorApi } from '../../shared/api/services'
import { useExcelExporter } from '../../shared/hooks/useExcelExporter'

function useDebouncedValue(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value.trim()), delay)
    return () => window.clearTimeout(timer)
  }, [delay, value])

  return debouncedValue
}

function MonitorHero({
  eyebrow,
  title,
  description,
  metrics,
  extra,
}: {
  eyebrow: string
  title: string
  description: string
  metrics: Array<{ label: string; value: number | string }>
  extra?: React.ReactNode
}) {
  return (
    <Card className="workspace-card">
      <div className="workspace-card__hero">
        <div>
          <Typography.Text className="eyebrow">{eyebrow}</Typography.Text>
          <Typography.Title level={3}>{title}</Typography.Title>
          <Typography.Paragraph>{description}</Typography.Paragraph>
        </div>
        <Space>{extra}</Space>
      </div>
      <div className="workspace-card__heroMeta">
        {metrics.map((item) => (
          <div className="metric-chip" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function MonitorServerPage() {
  const { message } = App.useApp()
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const result = await monitorApi.server()
      setData(result.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载服务监控失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <MonitorHero
        eyebrow="运行监控"
        title="服务监控"
        description="聚合 JVM、磁盘和基础资源信息，帮助快速确认服务是否处于健康状态。"
        metrics={[
          { label: '处理器', value: data.jvm?.processors ?? '-' },
          { label: '已用堆', value: data.jvm?.heapUsed ?? '-' },
          { label: '磁盘可用', value: data.disk?.usable ?? '-' },
        ]}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => void refresh()} loading={loading}>
            刷新
          </Button>
        }
      />

      <Row gutter={[18, 18]}>
        <Col span={12}>
          <Card className="workspace-card" title="JVM 指标" loading={loading}>
            <Descriptions column={1}>
              <Descriptions.Item label="运行时长">{data.jvm?.uptime ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="处理器">{data.jvm?.processors ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="已用堆">{data.jvm?.heapUsed ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="最大堆">{data.jvm?.heapMax ?? '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="workspace-card" title="磁盘信息" loading={loading}>
            <Descriptions column={1}>
              <Descriptions.Item label="总容量">{data.disk?.total ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="剩余空间">{data.disk?.free ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="可用空间">{data.disk?.usable ?? '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export function MonitorCachePage() {
  const { message } = App.useApp()
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const result = await monitorApi.cache()
      setData(result.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载缓存监控失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <MonitorHero
        eyebrow="缓存监控"
        title="Redis 运行概览"
        description="查看 Redis 版本、DB 大小和当前在线用户规模，方便排查缓存负载和会话规模。"
        metrics={[
          { label: 'Redis 版本', value: data.redisVersion ?? '-' },
          { label: 'DB 大小', value: data.redisDbSize ?? 0 },
          { label: '在线用户', value: data.onlineUsers ?? 0 },
        ]}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => void refresh()} loading={loading}>
            刷新
          </Button>
        }
      />

      <Row gutter={[18, 18]}>
        <Col span={8}>
          <Card className="workspace-card" loading={loading}>
            <Statistic title="Redis 版本" value={data.redisVersion ?? '-'} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="workspace-card" loading={loading}>
            <Statistic title="Redis DB 大小" value={data.redisDbSize ?? 0} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="workspace-card" loading={loading}>
            <Statistic title="在线用户" value={data.onlineUsers ?? 0} prefix={<GlobalOutlined />} />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export function MonitorOnlineUsersPage() {
  const { message } = App.useApp()
  const { exporting, exportWithLoader } = useExcelExporter()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword)

  const refresh = async (queryKeyword = debouncedKeyword) => {
    setLoading(true)
    try {
      const result = await monitorApi.onlineUsers({
        keyword: queryKeyword || undefined,
      })
      setRows(result.data)
      return result.data
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载在线用户失败')
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [debouncedKeyword])

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <MonitorHero
        eyebrow="在线会话"
        title="在线用户"
        description="查看当前在线会话、登录时间与最后活跃时间，必要时可以执行强制下线。"
        metrics={[{ label: '当前结果', value: rows.length }]}
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => void refresh()} loading={loading}>
              刷新
            </Button>
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={() =>
                void exportWithLoader({
                  columns: [
                    { title: '会话 ID', dataIndex: 'sessionId' },
                    { title: '用户名', dataIndex: 'username' },
                    { title: 'IP', dataIndex: 'ip' },
                    { title: '登录时间', dataIndex: 'loginTime' },
                    { title: '最后活跃', dataIndex: 'lastActiveTime' },
                    { title: '状态', value: () => '在线' },
                  ],
                  fileName: '在线用户',
                  loadRecords: async () => {
                    const result = await monitorApi.onlineUsers({
                      keyword: debouncedKeyword || undefined,
                    })
                    return result.data
                  },
                })
              }
            >
              导出
            </Button>
          </>
        }
      />

      <Card className="workspace-card">
        <div className="workspace-toolbar workspace-toolbar--stack">
          <Input
            allowClear
            name="online-user-search"
            placeholder="搜索用户名、IP 或会话 ID"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="workspace-search"
          />
        </div>
        <Table
          rowKey="sessionId"
          loading={loading}
          dataSource={rows}
          columns={[
            { title: '会话 ID', dataIndex: 'sessionId', ellipsis: true },
            { title: '用户名', dataIndex: 'username', width: 160 },
            { title: 'IP', dataIndex: 'ip', width: 160 },
            { title: '登录时间', dataIndex: 'loginTime', width: 200 },
            { title: '最后活跃', dataIndex: 'lastActiveTime', width: 200 },
            {
              title: '状态',
              key: 'status',
              width: 120,
              render: () => <Tag color="success">在线</Tag>,
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Button
                  type="link"
                  danger
                  icon={<WarningOutlined />}
                  onClick={async () => {
                    await monitorApi.forceLogout(record.sessionId)
                    message.success('会话已强制下线')
                    await refresh()
                  }}
                >
                  强制下线
                </Button>
              ),
            },
          ]}
          className="workspace-table"
        />
      </Card>
    </Space>
  )
}
