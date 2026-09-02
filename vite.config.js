import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/payments': 'http://127.0.0.1:3001',
      '/org-access': {
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/org-access/, ''),
      },
      '/customer-profile': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/customer-profile/, ''),
      },
    },
  },
})
