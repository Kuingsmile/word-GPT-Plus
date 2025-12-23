import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'async_hook': fileURLToPath(new URL('./async_hook.js', import.meta.url)),
      'node:async_hooks': fileURLToPath(new URL('./async_hook.js', import.meta.url)),
    }
  }
})
