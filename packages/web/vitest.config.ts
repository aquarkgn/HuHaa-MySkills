import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// 物理上存在两份 react/react-dom 副本：
//   node_modules/react           (根，@testing-library/react 用这份)
//   packages/web/node_modules/react  (packages/web/src/ 组件默认解析到这份)
// 两份副本 = 两个 React 实例，react-dom 设置的 HooksDispatcher 与组件
// useState 读取的 ReactCurrentDispatcher 不在同一个实例上，render(<Comp/>)
// 时报 "Cannot read properties of null (reading 'useState')"。
// 用 alias 把 react / react-dom / 子路径统一指向根副本，确保单一实例。
const rootReact = fileURLToPath(new URL('../../node_modules/react', import.meta.url))
const rootReactDOM = fileURLToPath(new URL('../../node_modules/react-dom', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // 强制使用 React 开发版本用于测试
    env: {
      NODE_ENV: 'development',
    },
    alias: [
      // 精确匹配 react / react-dom 及其子路径（如 react/jsx-runtime），
      // 不误伤 react-refresh、@vitejs/plugin-react 等
      { find: /^react$/, replacement: rootReact },
      { find: /^react\//, replacement: rootReact + '/' },
      { find: /^react-dom$/, replacement: rootReactDOM },
      { find: /^react-dom\//, replacement: rootReactDOM + '/' },
    ],
  },
})
