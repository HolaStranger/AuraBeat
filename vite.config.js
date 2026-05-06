import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',

  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      // Each /jioN/ prefix is proxied to a different API server — bypasses CORS
      // Local, private JioSaavn API instance (most reliable)
      '/jio1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jio1/, '/api'),
        secure: false,
      },
      '/jio2': {
        target: 'https://jiosaavn-api-2.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jio2/, ''),
        secure: true,
      },
      '/jio3': {
        target: 'https://jiosaavn-api-beta-one.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jio3/, ''),
        secure: true,
      },
      '/jio4': {
        target: 'https://jioapi-v3.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jio4/, ''),
        secure: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
})
