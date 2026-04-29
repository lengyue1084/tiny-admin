import { describe, expect, it } from 'vitest'
import { buildSheetRows, buildWorkbookSheetName, sanitizeExportFileName } from './export'

type DemoRecord = {
  name: string
  owner: {
    name: string
  }
  remark?: string
  status: string
  tags: string[]
}

describe('buildSheetRows', () => {
  it('builds worksheet rows from nested values and custom resolvers', () => {
    const rows = buildSheetRows<DemoRecord>(
      [
        { title: '名称', dataIndex: 'name' },
        { title: '负责人', dataIndex: ['owner', 'name'] },
        { title: '标签', value: (record) => record.tags },
        { title: '状态', value: (record) => (record.status === 'enabled' ? '启用' : '停用') },
      ],
      [
        {
          name: '平台项目',
          owner: { name: '张三' },
          status: 'enabled',
          tags: ['核心', '平台'],
        },
      ],
    )

    expect(rows).toEqual([
      ['名称', '负责人', '标签', '状态'],
      ['平台项目', '张三', '核心 / 平台', '启用'],
    ])
  })

  it('keeps commas, quotes and line breaks as raw cell content for xlsx writers', () => {
    const rows = buildSheetRows(
      [
        { title: '标题', dataIndex: 'title' },
        { title: '备注', dataIndex: 'remark' },
      ],
      [
        { title: '平台', remark: '包含,逗号' },
        { title: '系统', remark: '包含"引号"\n和换行' },
      ],
    )

    expect(rows[1][1]).toBe('包含,逗号')
    expect(rows[2][1]).toBe('包含"引号"\n和换行')
  })
})

describe('buildWorkbookSheetName', () => {
  it('removes invalid worksheet characters and truncates safely', () => {
    expect(buildWorkbookSheetName('角色管理 / 2026-04-30 * 导出')).toBe('角色管理-2026-04-30-导出')
  })
})

describe('sanitizeExportFileName', () => {
  it('keeps safe characters and normalizes blanks', () => {
    expect(sanitizeExportFileName('角色管理 / 2026-04-30')).toBe('角色管理-2026-04-30')
    expect(sanitizeExportFileName('   ')).toBe('export')
  })
})
