import path from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// pages.json 由 uni-pages 生成，含整行 // 注释（JSONC），vite 内置 json 插件无法解析。
// 仅剥离「整行注释」（以可选空白 + // 开头的行），不影响字符串内的 URL
function stripPagesJsonComments() {
  return {
    name: 'vitest-strip-pages-json-comments',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.endsWith('src/pages.json')) {
        return { code: code.replace(/^\s*\/\/.*$/gm, ''), map: null }
      }
    },
  }
}

export default defineConfig({
  plugins: [stripPagesJsonComments(), vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'src/uni_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@img': path.resolve(process.cwd(), 'src/static/images'),
    },
  },
})
