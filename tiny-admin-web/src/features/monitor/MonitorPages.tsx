import { Card, Col, Descriptions, Row, Statistic, Table, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { monitorApi } from '../../shared/api/services'

export function MonitorServerPage() {
  const [data, setData] = useState<Record<string, any>>({})

  useEffect(() => {
    void monitorApi.server().then((result) => setData(result.data))
  }, [])

  return (
    <Row gutter={[24, 24]}>
      <Col span={12}>
        <Card className="page-card" title="JVM 指标">
          <Descriptions column={1}>
            <Descriptions.Item label="运行时长">{data.jvm?.uptime ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="处理器">{data.jvm?.processors ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="已用堆">{data.jvm?.heapUsed ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="最大堆">{data.jvm?.heapMax ?? '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
      <Col span={12}>
        <Card className="page-card" title="磁盘信息">
          <Descriptions column={1}>
            <Descriptions.Item label="总容量">{data.disk?.total ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="剩余空间">{data.disk?.free ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="可用空间">{data.disk?.usable ?? '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  )
}

export function MonitorCachePage() {
  const [data, setData] = useState<Record<string, any>>({})

  useEffect(() => {
    void monitorApi.cache().then((result) => setData(result.data))
  }, [])

  return (
    <Row gutter={[24, 24]}>
      <Col span={8}>
        <Card className="page-card">
          <Statistic title="Redis 版本" value={data.redisVersion ?? '-'} />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="page-card">
          <Statistic title="Redis DB Size" value={data.redisDbSize ?? 0} />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="page-card">
          <Statistic title="在线用户" value={data.onlineUsers ?? 0} />
        </Card>
      </Col>
    </Row>
  )
}

export function MonitorOnlineUsersPage() {
  const [rows, setRows] = useState<any[]>([])

  const refresh = async () => {
    const result = await monitorApi.onlineUsers()
    setRows(result.data)
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <Card className="page-card" title="在线用户">
      <Typography.Paragraph>支持查看会话和强制下线指定账号。</Typography.Paragraph>
      <Table
        rowKey="sessionId"
        dataSource={rows}
        columns={[
          { title: '会话 ID', dataIndex: 'sessionId', ellipsis: true },
          { title: '用户名', dataIndex: 'username' },
          { title: 'IP', dataIndex: 'ip' },
          { title: '登录时间', dataIndex: 'loginTime' },
          { title: '最后活跃', dataIndex: 'lastActiveTime' },
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <a
                onClick={async () => {
                  await monitorApi.forceLogout(record.sessionId)
                  message.success('已强制下线')
                  await refresh()
                }}
              >
                强制下线
              </a>
            ),
          },
        ]}
      />
    </Card>
  )
}
