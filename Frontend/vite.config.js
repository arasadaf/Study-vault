import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Server options – removed custom COOP header to allow Google OAuth popup communication.
  server: {
    proxy: {
      // Forward API requests to the backend to avoid wrong base URLs / 404s.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // In case any clients request backend uploads.
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

