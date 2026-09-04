import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/payments': {
        target: 'http://127.0.0.1:3314',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/payments/, ''),
      },
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
      '/catalog': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/catalog/, ''),
      },
      '/inventory': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/inventory/, ''),
      },
      '/cart': {
        target: 'http://127.0.0.1:8091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cart/, ''),
      },
      '/order': {
        target: 'http://127.0.0.1:3311',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/order/, ''),
      },
      '/fulfillment': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fulfillment/, ''),
      },
      '/alerts': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/alerts/, ''),
      },
    },
  },
})
