import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pennyweek-backend.onrender.com',  // your backend URL here
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
