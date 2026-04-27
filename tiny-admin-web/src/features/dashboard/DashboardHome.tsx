import { MonitorOutlined, RocketOutlined, SafetyCertificateOutlined, ScheduleOutlined } from '@ant-design/icons'
import { Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'

const progressItems = [
  { title: '账号、角色、菜单和数据范围', percent: 92, tone: 'success' as const },
  { title: '日志、监控与在线用户', percent: 80, tone: 'processing' as const },
  { title: '任务调度与执行日志', percent: 76, tone: 'processing' as const },
  { title: '示例业务接入与权限链路', percent: 68, tone: 'warning' as const },
]

const nextSteps = [
  '先在系统管理中完成用户、角色、部门与菜单的基础配置，再用新角色验证动态菜单与按钮权限。',
  '新建一条定时任务并手动执行，确认任务编排、状态切换和执行日志链路完整可用。',
  '使用示例业务模块再走一遍菜单、页面、权限点与日志的扩展接入流程。',
]

export function DashboardHome() {
  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <div className="hero-panel">
        <section className="hero-card">
          <Tag color="cyan">平台工作台</Tag>
          <Typography.Title style={{ color: '#fff', fontSize: 40, marginBottom: 12 }}>
            用更稳的后台结构承接
            <br />
            系统管理与业务扩展
          </Typography.Title>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.9 }}>
            这里把系统管理、审计、监控、调度和业务模块放进同一套工作区体验里，让权限、日志和平台能力都能以统一方式协同运转。
          </Typography.Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 28 }}>
            <Col span={12}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>启用模块</span>}
                value={5}
                suffix="个"
                styles={{ content: { color: '#fff' } }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>默认角色</span>}
                value="SUPER_ADMIN"
                styles={{ content: { color: '#fff', fontSize: 22 } }}
              />
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

      <Row gutter={[18, 18]}>
        <Col span={14}>
          <Card className="page-card" title="平台推进节奏">
            <div className="insight-list">
              {progressItems.map((item) => (
                <div className="insight-list__item" key={item.title}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Tag color={item.tone}>{item.percent}%</Tag>
                  </Space>
                  <Progress percent={item.percent} showInfo={false} strokeColor="#18B8C9" />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={10}>
          <Card className="page-card" title="建议下一步">
            <div className="suggestion-list">
              {nextSteps.map((item) => (
                <div className="suggestion-list__item" key={item}>
                  <Typography.Text>{item}</Typography.Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
