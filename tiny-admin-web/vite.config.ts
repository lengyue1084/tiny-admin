import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }

          if (id.includes('@ant-design/icons')) {
            return 'ant-icons'
          }

          if (id.includes('rc-table') || id.includes('/table')) {
            return 'ant-table'
          }

          if (id.includes('rc-tree') || id.includes('rc-tree-select')) {
            return 'ant-tree'
          }

          if (id.includes('rc-select') || id.includes('rc-cascader')) {
            return 'ant-select'
          }

          if (id.includes('rc-picker') || id.includes('rc-calendar')) {
            return 'ant-picker'
          }

          if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) {
            return 'antd-core'
          }

          if (id.includes('axios') || id.includes('zustand') || id.includes('dayjs') || id.includes('clsx')) {
            return 'shared-vendor'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
