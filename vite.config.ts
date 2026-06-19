import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // @ts-expect-error Vite and Vitest peer dependency conflict
  plugins: [react()],
})
