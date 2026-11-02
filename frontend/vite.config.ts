/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/** Don't let the browser keep a copy of the app shell that Back can show. */
function keepDocumentsUnstored(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: Function }, next: () => void) => void) => void } }) {
  server.middlewares.use((req, res, next) => {
    const path = req.url?.split('?')[0] ?? ''
    const isDocument = !path.includes('.') || path.endsWith('.html')
    if (isDocument) {
      const setHeader = res.setHeader.bind(res)
      res.setHeader = (name: unknown, value: unknown) => {
        if (String(name).toLowerCase() === 'cache-control') {
          return setHeader('Cache-Control', 'no-store')
        }
        return setHeader(name, value)
      }
      res.setHeader('Cache-Control', 'no-store')
    }
    next()
  })
}

function noStoreDocuments(): Plugin {
  return {
    name: 'no-store-documents',
    configureServer(server) {
      keepDocumentsUnstored(server)
    },
    configurePreviewServer(server) {
      keepDocumentsUnstored(server)
    },
  }
}

export default defineConfig({
  plugins: [react(), noStoreDocuments()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
    css: true,
  },
})
