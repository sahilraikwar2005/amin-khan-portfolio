import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Forward contact form requests to the local Nodemailer API during development.
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
