import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, App, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../app/store/authStore'
import { authApi } from '../../shared/api/services'

export function LoginPage() {
  const { message } = App.useApp()
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
          <Typography.Title style={{ color: '#fff', fontSize: 48, marginTop: 0 }}>Tiny Admin</Typography.Title>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 18, lineHeight: 1.9 }}>
            面向权限、审计、监控、调度和业务扩展场景打造的现代化后台底座。单体架构保持清晰，前端工作区保持克制，方便长期迭代真实业务。
          </Typography.Paragraph>

          <Space orientation="vertical" size="middle" style={{ width: '100%', marginTop: 48 }}>
            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Typography.Text style={{ color: '#fff' }}>系统管理、审计日志、运维监控、任务调度、示例业务一体化协同</Typography.Text>
            </Card>
            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Typography.Text style={{ color: '#fff' }}>单侧栏工作区结构，适合平台型后台的多模块长期演进</Typography.Text>
            </Card>
            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Typography.Text style={{ color: '#fff' }}>默认账号：admin / admin123</Typography.Text>
            </Card>
          </Space>
        </section>

        <section className="login-form">
          <Typography.Title level={2}>登录平台</Typography.Title>
          <Typography.Paragraph>从平台底座开始，把真实业务模块稳定接进来。</Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
            title="开发提示"
            description="当前验证码来自后端接口；如果刷新失败，可以点击图片重新获取。"
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
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input size="large" prefix={<UserOutlined />} autoComplete="username" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
            </Form.Item>
            <Form.Item label="验证码" required>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="captchaCode" noStyle rules={[{ required: true, message: '请输入验证码' }]}>
                  <Input size="large" prefix={<SafetyOutlined />} autoComplete="one-time-code" />
                </Form.Item>
                <Button style={{ width: 156, height: 46 }} onClick={() => void loadCaptcha()}>
                  {captchaImage ? <img src={captchaImage} alt="captcha" style={{ width: '100%', height: 32, objectFit: 'cover' }} /> : '获取中...'}
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
