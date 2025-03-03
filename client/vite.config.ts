import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3033',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '\/')
      },
    },


  },
  plugins: [react()],
})
