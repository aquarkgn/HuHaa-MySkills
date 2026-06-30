import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 产物 dist/ 由 Fastify(packages/server) 静态托管：
// dist/index.html → GET /，dist/assets/* → GET /assets/*。
// 因此保持 base='/'、assetsDir='assets'，与服务器约定一致。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 11521,
    open: true,
    // dev 模式下把 /api 代理到正在运行的 Fastify(11520)，便于联调
    proxy: {
      '/api': 'http://127.0.0.1:11520',
      '/assets': 'http://127.0.0.1:11520',
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 11522,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 使用 esbuild 压缩（vite 内置，无需额外 terser 依赖）
    minify: 'esbuild',
  },
})
