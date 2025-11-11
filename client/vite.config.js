import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // <-- 1. IMPORTA 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 2. AÑADE ESTE BLOQUE 'resolve'
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})