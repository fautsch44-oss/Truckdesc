import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static single-page app. Builds to ./dist for Netlify.
export default defineConfig({
  plugins: [react()],
})
