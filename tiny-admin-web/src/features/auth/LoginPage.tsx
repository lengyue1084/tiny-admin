import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Space, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../shared/api/services'
import { useAuthStore } from '../../app/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, user } = useAuthStore()
  const [captchaKey, setCaptchaKey] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')

  const loadCaptcha = async () => {
    const result = await authApi.captcha()
    setCaptchaKey(result.data.captchaKey)
    setCaptchaImage(result.data.captchaImage)
  }

  useEffect(() => {
    void loadCaptcha()
  }, [])

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  return (
    <div className="login-screen">
      <div className="login-card">
        <section className="login-visual">
          <Typography.Title style={{ color: '#fff', fontSize: 48, marginTop: 0 }}>
            Tiny Admin
          </Typography.Title>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 18 }}>
            参考 RuoYi 能力模型重新打造的现代化 React 后台平台。保留权限、审计、监控和调度能力，同时把体验做得更轻、更清晰。
          </Typography.Paragraph>
          <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 48 }}>
            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Typography.Text style={{ color: '#fff' }}>系统管理、审计、监控、调度、示例业务</Typography.Text>
            </Card>
            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Typography.Text style={{ color: '#fff' }}>双栏增强型导航，适合大模块与细分页面并存</Typography.Text>
            </Card>
            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Typography.Text style={{ color: '#fff' }}>默认账号: admin / admin123</Typography.Text>
            </Card>
          </Space>
        </section>

        <section className="login-form">
          <Typography.Title level={2}>登录平台</Typography.Title>
          <Typography.Paragraph>从平台底座开始，把后续业务模块接进来。</Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
            message="开发提示"
            description="当前验证码来自后端接口；如果刷新失败，可以点击图片重取。"
          />
          <Form
            layout="vertical"
            onFinish={async (values) => {
              try {
                await login({
                  username: values.username,
                  password: values.password,
                  captchaKey,
                  captchaCode: values.captchaCode,
                })
                const target = (location.state as { from?: string } | null)?.from ?? '/'
                navigate(target, { replace: true })
              } catch (error) {
                message.error(error instanceof Error ? error.message : '登录失败')
                await loadCaptcha()
              }
            }}
            initialValues={{ username: 'admin', password: 'admin123' }}
          >
            <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
              <Input size="large" prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true }]}>
              <Input.Password size="large" prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item label="验证码" required>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="captchaCode" noStyle rules={[{ required: true }]}>
                  <Input size="large" prefix={<SafetyOutlined />} />
                </Form.Item>
                <Button style={{ width: 156, height: 40 }} onClick={() => void loadCaptcha()}>
                  <img src={captchaImage} alt="captcha" style={{ width: '100%', height: 32, objectFit: 'cover' }} />
                </Button>
              </Space.Compact>
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              进入控制台
            </Button>
          </Form>
        </section>
      </div>
    </div>
  )
}
