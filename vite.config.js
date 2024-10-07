import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist', // Directory for build output relative to the config file
    emptyOutDir: true, // Empties the outDir on build
  },
})
