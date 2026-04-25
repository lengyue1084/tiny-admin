import { MonitorOutlined, RocketOutlined, SafetyCertificateOutlined, ScheduleOutlined } from '@ant-design/icons'
import { Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'

export function DashboardHome() {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div className="hero-panel">
        <section className="hero-card">
          <Tag color="gold">平台工作台</Tag>
          <Typography.Title style={{ color: '#fff', fontSize: 42, marginBottom: 12 }}>
            用现代化体验承接
            <br />
            单体后台的复杂度
          </Typography.Title>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16 }}>
            这里聚合系统管理、导航、工作台和常见管理页面，
            让权限、审计、监控与业务扩展在统一中后台体验下协同工作。
          </Typography.Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
            <Col span={12}>
              <Statistic title={<span style={{ color: '#d8e6ff' }}>运行模块</span>} value={5} suffix="个" valueStyle={{ color: '#fff' }} />
            </Col>
            <Col span={12}>
              <Statistic title={<span style={{ color: '#d8e6ff' }}>默认角色</span>} value="SUPER_ADMIN" valueStyle={{ color: '#fff', fontSize: 22 }} />
            </Col>
          </Row>
        </section>
        <div className="stat-grid">
          <Card className="metric-tile">
            <Statistic title="系统管理" value={8} suffix="页" prefix={<SafetyCertificateOutlined />} />
          </Card>
          <Card className="metric-tile">
            <Statistic title="监控与审计" value={5} suffix="页" prefix={<MonitorOutlined />} />
          </Card>
          <Card className="metric-tile">
            <Statistic title="任务调度" value={2} suffix="页" prefix={<ScheduleOutlined />} />
          </Card>
          <Card className="metric-tile">
            <Statistic title="示例业务" value={1} suffix="模块" prefix={<RocketOutlined />} />
          </Card>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={14}>
          <Card className="page-card" title="平台推进节奏">
            <List
              dataSource={[
                { title: '账号、角色、菜单和数据范围', percent: 88, tone: 'success' },
                { title: '日志、监控、在线用户', percent: 76, tone: 'processing' },
                { title: '任务调度与执行日志', percent: 71, tone: 'processing' },
                { title: '示例业务接入验证', percent: 64, tone: 'warning' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Tag color={item.tone as any}>{item.percent}%</Tag>
                    </Space>
                    <Progress percent={item.percent} showInfo={false} strokeColor="#125BFF" />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card className="page-card" title="建议下一步">
            <List
              dataSource={[
                '先完成系统管理中的基础配置，再用新角色验证动态菜单和按钮权限。',
                '完成一次定时任务新增与手动执行，确保作业编排链路可用。',
                '用示例业务模块再走一遍新增菜单、页面和权限点的接入流程。',
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text>{item}</Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
