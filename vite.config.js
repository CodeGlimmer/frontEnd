import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), vueJsx(), viteSingleFile()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 禁用 CSS 代码拆分
    cssCodeSplit: false,
    // 减小构建后的文件体积
    minify: true,
    // 关闭 source maps
    sourcemap: false,
    assetsInlineLimit: 1000000,
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 5173, // 指定端口（可选）
  },
})
