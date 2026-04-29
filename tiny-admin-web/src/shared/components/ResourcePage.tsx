import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import type { ListQuery } from '../api/services'

type ResourceField =
  | { name: string; label: string; type?: 'text' | 'textarea'; required?: boolean }
  | { name: string; label: string; type: 'number'; required?: boolean }
  | { name: string; label: string; type: 'select'; required?: boolean; options: { label: string; value: string | number }[] }

type FilterValue = string | number | boolean

type ResourceSearchConfig = {
  placeholder?: string
  paramKey?: string
}

type ResourceFilterOption = {
  label: string
  value: FilterValue
}

type ResourceFilterConfig<T> = {
  key: string
  placeholder: string
  paramKey?: string
  width?: number
  allowClear?: boolean
  options: ResourceFilterOption[] | ((rows: T[]) => ResourceFilterOption[])
}

type ResourcePageProps<T extends { id?: number | string }> = {
  title: string
  description: string
  columns: any[]
  load: (query?: ListQuery) => Promise<{ data: T[] }>
  save: (payload: Partial<T>) => Promise<any>
  remove?: (id: number) => Promise<any>
  fields?: ResourceField[]
  defaultValues?: Partial<T>
  modalWidth?: number
  search?: false | ResourceSearchConfig
  filters?: ResourceFilterConfig<T>[]
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
  modalWidth = 620,
  search,
  filters = [],
}: ResourcePageProps<T>) {
  const { message } = App.useApp()
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [current, setCurrent] = useState<Partial<T> | null>(null)
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue | undefined>>({})
  const [form] = Form.useForm()
  const editable = fields.length > 0
  const hasActions = editable || Boolean(remove)
  const searchParamKey = search === false ? undefined : search?.paramKey ?? 'keyword'

  const resolvedFilters = useMemo(
    () =>
      filters.map((filter) => ({
        ...filter,
        options: typeof filter.options === 'function' ? filter.options(rows) : filter.options,
      })),
    [filters, rows],
  )
  const filterQueryMeta = useMemo(
    () => filters.map((filter) => `${filter.key}:${filter.paramKey ?? filter.key}`).join('|'),
    [filters],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setFilterValues((currentValues) => {
      const allowedKeys = new Set(resolvedFilters.map((filter) => filter.key))
      const nextEntries = Object.entries(currentValues).filter(([key]) => allowedKeys.has(key))

      if (nextEntries.length === Object.keys(currentValues).length) {
        return currentValues
      }

      return Object.fromEntries(nextEntries)
    })
  }, [filterQueryMeta, resolvedFilters])

  const requestQuery = useMemo(() => {
    const query: ListQuery = {}
    if (debouncedKeyword && searchParamKey) {
      query[searchParamKey] = debouncedKeyword
    }
    for (const filter of filters) {
      const value = filterValues[filter.key]
      if (value !== undefined) {
        query[filter.paramKey ?? filter.key] = value
      }
    }
    return query
  }, [debouncedKeyword, filterValues, filters, searchParamKey])

  const refresh = async (query: ListQuery = requestQuery) => {
    setLoading(true)
    try {
      const result = await load(query)
      setRows(result.data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [debouncedKeyword, filterValues, filterQueryMeta, searchParamKey])

  const mergedColumns = useMemo(() => {
    if (!hasActions) {
      return columns
    }

    return [
      ...columns,
      {
        title: '操作',
        key: 'action',
        width: editable && remove ? 170 : 120,
        render: (_: unknown, record: T) => (
          <Space size={4}>
            {editable ? (
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
            ) : null}
            {remove && record.id ? (
              <Popconfirm
                title="确认删除这条记录？"
                description="删除后不可恢复，请谨慎操作。"
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
      },
    ]
  }, [columns, editable, form, hasActions, message, remove])

  return (
    <>
      <Card className="workspace-card">
        <div className="workspace-card__hero">
          <div>
            <Typography.Text className="eyebrow">基础能力</Typography.Text>
            <Typography.Title level={3}>{title}</Typography.Title>
            <Typography.Paragraph>{description}</Typography.Paragraph>
          </div>
          <div className="workspace-card__heroMeta">
            <div className="metric-chip">
              <span>当前记录</span>
              <strong>{rows.length}</strong>
            </div>
          </div>
        </div>

        <div className="workspace-toolbar workspace-toolbar--stack">
          {search === false ? null : (
            <Input
              allowClear
              name="resource-search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder={search?.placeholder ?? `搜索${title}`}
              className="workspace-search"
            />
          )}
          <Space wrap>
            {resolvedFilters.map((filter) => (
              <Select
                key={filter.key}
                allowClear={filter.allowClear ?? true}
                placeholder={filter.placeholder}
                options={filter.options}
                value={filterValues[filter.key]}
                onChange={(value) => {
                  setFilterValues((currentValues) => ({
                    ...currentValues,
                    [filter.key]: value as FilterValue | undefined,
                  }))
                }}
                style={{ width: filter.width ?? 160 }}
              />
            ))}
            <Button icon={<ReloadOutlined />} onClick={() => void refresh(requestQuery)}>
              刷新
            </Button>
            {editable ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrent(null)
                  form.resetFields()
                  form.setFieldsValue(defaultValues ?? {})
                  setOpen(true)
                }}
              >
                新建
              </Button>
            ) : null}
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={mergedColumns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          className="workspace-table"
        />
      </Card>

      {editable ? (
        <Modal
          title={`${current?.id ? '编辑' : '新建'}${title}`}
          open={open}
          width={modalWidth}
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
              <Form.Item key={field.name} name={field.name} label={field.label} rules={[{ required: field.required, message: `请输入${field.label}` }]}>
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
      ) : null}
    </>
  )
}

export const statusTag = (value: string | number) => {
  if (value === 1 || value === '1' || value === '启用' || value === '进行中' || value === '成功') {
    return <Tag color="success">{String(value)}</Tag>
  }
  if (value === 0 || value === '0' || value === '停用' || value === '规划中') {
    return <Tag>{String(value)}</Tag>
  }
  if (value === '失败') {
    return <Tag color="error">{String(value)}</Tag>
  }
  return <Tag color="processing">{String(value)}</Tag>
}
