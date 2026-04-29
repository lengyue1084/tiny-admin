import * as XLSX from 'xlsx'

export type ExportColumn<T> = {
  title: string
  dataIndex?: string | Array<string | number>
  value?: (record: T, index: number) => unknown
}

function readPathValue(source: unknown, path: string | Array<string | number>) {
  const segments = Array.isArray(path) ? path : path.split('.')
  let current: unknown = source

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string | number, unknown>)[segment]
  }

  return current
}

function normalizeCellValue(value: unknown): string {
  if (value == null) {
    return ''
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeCellValue(item)).filter(Boolean).join(' / ')
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return String(value)
}

export function buildSheetRows<T>(columns: ExportColumn<T>[], records: T[]) {
  const headerRow = columns.map((column) => column.title)
  const dataRows = records.map((record, index) =>
    columns.map((column) => {
      const rawValue = column.value ? column.value(record, index) : column.dataIndex ? readPathValue(record, column.dataIndex) : undefined
      return normalizeCellValue(rawValue)
    }),
  )

  return [headerRow, ...dataRows]
}

export function sanitizeExportFileName(fileName: string) {
  const normalized = fileName
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || 'export'
}

export function buildWorkbookSheetName(fileName: string) {
  return sanitizeExportFileName(fileName).slice(0, 31) || 'Sheet1'
}

export function exportRecordsToWorkbook<T>(options: {
  columns: ExportColumn<T>[]
  fileName: string
  records: T[]
}) {
  const rows = buildSheetRows(options.columns, options.records)
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, buildWorkbookSheetName(options.fileName))
  XLSX.writeFileXLSX(workbook, `${sanitizeExportFileName(options.fileName)}.xlsx`, {
    compression: true,
  })
  return rows.length - 1
}
