import { App } from 'antd'
import { useState } from 'react'
import { exportRecordsToWorkbook, type ExportColumn } from '../utils/export'

export function useExcelExporter() {
  const { message } = App.useApp()
  const [exporting, setExporting] = useState(false)

  const exportWithLoader = async <T>(options: {
    columns: ExportColumn<T>[]
    errorMessage?: string
    fileName: string
    loadRecords: () => Promise<T[]>
    successMessage?: string
  }) => {
    setExporting(true)
    try {
      const records = await options.loadRecords()
      const count = exportRecordsToWorkbook({
        columns: options.columns,
        fileName: options.fileName,
        records,
      })
      message.success(options.successMessage ?? `已导出 ${count} 条记录`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : options.errorMessage ?? '导出失败')
    } finally {
      setExporting(false)
    }
  }

  return {
    exporting,
    exportWithLoader,
  }
}
