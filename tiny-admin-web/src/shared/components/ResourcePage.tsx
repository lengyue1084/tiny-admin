import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'

type ResourceField =
  | { name: string; label: string; type?: 'text' | 'textarea'; required?: boolean }
  | { name: string; label: string; type: 'number'; required?: boolean }
  | { name: string; label: string; type: 'select'; required?: boolean; options: { label: string; value: string | number }[] }

type ResourcePageProps<T extends { id?: number | string }> = {
  title: string
  description: string
  columns: any[]
  load: () => Promise<{ data: T[] }>
  save: (payload: Partial<T>) => Promise<any>
  remove?: (id: number) => Promise<any>
  fields?: ResourceField[]
  defaultValues?: Partial<T>
}

export function ResourcePage<T extends { id?: number | string }>({
  title,
  description,
  columns,
  load,
  save,
  remove,
  fields = [],
  defaultValues,
}: ResourcePageProps<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Partial<T> | null>(null)
  const [form] = Form.useForm()

  const refresh = async () => {
    setLoading(true)
    try {
      const result = await load()
      setRows(result.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const mergedColumns = useMemo(
    () => [
      ...columns,
      remove
        ? {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: T) => (
              <Space>
                <Button
                  type="link"
                  onClick={() => {
                    setCurrent(record)
                    form.setFieldsValue(record)
                    setOpen(true)
                  }}
                >
                  编辑
                </Button>
                {record.id ? (
                  <Popconfirm
                    title="确认删除这条记录？"
                    onConfirm={async () => {
                      await remove(Number(record.id))
                      message.success('删除成功')
                      await refresh()
                    }}
                  >
                    <Button type="link" danger>
                      删除
                    </Button>
                  </Popconfirm>
                ) : null}
              </Space>
            ),
          }
        : {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: T) => (
              <Button
                type="link"
                onClick={() => {
                  setCurrent(record)
                  form.setFieldsValue(record)
                  setOpen(true)
                }}
              >
                编辑
              </Button>
            ),
          },
    ],
    [columns, form, remove],
  )

  return (
    <>
      <Card className="page-card">
        <div className="page-card__header">
          <div>
            <Typography.Title level={3}>{title}</Typography.Title>
            <Typography.Paragraph>{description}</Typography.Paragraph>
          </div>
          {fields.length > 0 ? (
            <Button
              type="primary"
              onClick={() => {
                setCurrent(null)
                form.resetFields()
                form.setFieldsValue(defaultValues ?? {})
                setOpen(true)
              }}
            >
              新增
            </Button>
          ) : null}
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={mergedColumns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>
      <Modal
        title={`${current?.id ? '编辑' : '新增'}${title}`}
        open={open}
        width={620}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const values = await form.validateFields()
          await save({ ...defaultValues, ...current, ...values })
          setOpen(false)
          message.success('保存成功')
          await refresh()
        }}
      >
        <Form form={form} layout="vertical">
          {fields.map((field) => (
            <Form.Item key={field.name} name={field.name} label={field.label} rules={[{ required: field.required }]}>
              {'type' in field && field.type === 'textarea' ? (
                <Input.TextArea rows={4} />
              ) : 'type' in field && field.type === 'number' ? (
                <InputNumber style={{ width: '100%' }} />
              ) : 'type' in field && field.type === 'select' ? (
                <Select options={field.options} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  )
}

export const statusTag = (value: string | number) => {
  if (value === 1 || value === '1' || value === '启用' || value === '进行中') {
    return <Tag color="success">{String(value)}</Tag>
  }
  if (value === 0 || value === '0' || value === '停用') {
    return <Tag>{String(value)}</Tag>
  }
  return <Tag color="processing">{String(value)}</Tag>
}
