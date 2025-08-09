import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787'
    },
    watch: {
      // fsevents を使わない（ここが重要）
      useFsEvents: false,
      // 念のためポーリングに固定
      usePolling: true,
      interval: 150
    }
  }
})
