import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // LangChain uses async_hooks; the Office webview needs its browser shim.
      { find: /^(?:node:)?async_hooks$/, replacement: fileURLToPath(new URL('./async_hook.js', import.meta.url)) },
    ],
  },
  // Office manifests use a fixed origin: fail instead of silently changing ports.
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  build: { target: 'es2022' },
})
