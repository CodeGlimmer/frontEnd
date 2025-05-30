import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
// import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), viteSingleFile()],
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
    target: 'esnext', // Set to the latest
  },
  esbuild: {
    target: 'esnext', // Set to the latest
    supported: {
      'top-level-await': true, // Explicitly enable top-level await
    },
  },
  // build: {
  //   target: 'esnext', // 允许顶级 await
  //   chunkSizeWarningLimit: 2000,
  // },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
