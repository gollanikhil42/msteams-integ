import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react({ fastRefresh: mode !== 'test' })],
  server: {
    port: 3000,
    open: true,
    strictPort: false
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**']
    }
  }
}))
