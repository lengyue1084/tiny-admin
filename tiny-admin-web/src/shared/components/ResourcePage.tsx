import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'

type ResourceField =
  | { name: string; label: string; type?: 'text' | 'textarea'; required?: boolean }
  | { name: string; label: string; type: 'number'; required?: boolean }
  | { name: string; label: string; type: 'select'; required?: boolean; options: { label: string; value: string | number }[] }

type FilterValue = string | number | boolean

type ResourceSearchField<T> = keyof T | ((row: T) => unknown)

type ResourceSearchConfig<T> = {
  placeholder?: string
  fields?: ResourceSearchField<T>[]
  match?: (row: T, keyword: string) => boolean
}

type ResourceFilterOption = {
  label: string
  value: FilterValue
}

type ResourceFilterConfig<T> = {
  key: string
  placeholder: string
  width?: number
  allowClear?: boolean
  options: ResourceFilterOption[] | ((rows: T[]) => ResourceFilterOption[])
  field?: keyof T | ((row: T) => unknown)
  match?: (row: T, value: FilterValue) => boolean
}

type ResourcePageProps<T extends { id?: number | string }> = {
  title: string
  description: string
  columns: any[]
  load: () => Promise<{ data: T[] }>
  save: (payload: Partial<T>) => Promise<any>
  remove?: (id: number) => Promise<any>
  fields?: ResourceField[]
  defaultValues?: Partial<T>
  modalWidth?: number
  search?: false | ResourceSearchConfig<T>
  filters?: ResourceFilterConfig<T>[]
}

function resolveFieldValue<T>(row: T, field?: keyof T | ((item: T) => unknown)) {
  if (!field) {
    return undefined
  }

  return typeof field === 'function' ? field(row) : row[field]
}

function includesKeyword<T>(row: T, keyword: string, fields?: ResourceSearchField<T>[]) {
  const query = keyword.trim().toLowerCase()
  if (!query) {
    return true
  }

  const values = fields?.length
    ? fields.map((field) => resolveFieldValue(row, field))
    : Object.values(row as Record<string, unknown>)

  return values.some((value) => String(value ?? '').toLowerCase().includes(query))
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
  const [current, setCurrent] = useState<Partial<T> | null>(null)
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue | undefined>>({})
  const [form] = Form.useForm()
  const editable = fields.length > 0
  const hasActions = editable || Boolean(remove)

  const resolvedFilters = useMemo(
    () =>
      filters.map((filter) => ({
        ...filter,
        options: typeof filter.options === 'function' ? filter.options(rows) : filter.options,
      })),
    [filters, rows],
  )

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

  useEffect(() => {
    setFilterValues((currentValues) => {
      const nextValues: Record<string, FilterValue | undefined> = {}
      for (const filter of resolvedFilters) {
        nextValues[filter.key] = currentValues[filter.key]
      }
      return nextValues
    })
  }, [resolvedFilters])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesKeyword =
        search === false
          ? true
          : search?.match
            ? search.match(row, keyword.trim())
            : includesKeyword(row, keyword, search?.fields)

      if (!matchesKeyword) {
        return false
      }

      return resolvedFilters.every((filter) => {
        const filterValue = filterValues[filter.key]
        if (filterValue === undefined) {
          return true
        }

        if (filter.match) {
          return filter.match(row, filterValue)
        }

        const fieldValue = resolveFieldValue(row, filter.field ?? (filter.key as keyof T))
        return String(fieldValue ?? '') === String(filterValue)
      })
    })
  }, [filterValues, keyword, resolvedFilters, rows, search])

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
            <div className="metric-chip">
              <span>筛选结果</span>
              <strong>{filteredRows.length}</strong>
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
            <Button icon={<ReloadOutlined />} onClick={() => void refresh()}>
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
          dataSource={filteredRows}
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
