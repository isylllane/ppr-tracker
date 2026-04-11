import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // Слушаем все сетевые интерфейсы
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Для телефона нужно будет заменить на IP
        changeOrigin: true
      }
    }
  }
})