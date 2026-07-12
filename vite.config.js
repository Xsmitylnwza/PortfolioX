import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('scheduler') ||
            // Keep jsx runtime with React so lazy page chunks do not import back into index.
            id.includes('react/jsx-runtime') ||
            id.includes('react/jsx-dev-runtime') ||
            /[\\/]react[\\/]/.test(id)
          ) {
            return 'react-vendor';
          }
          if (id.includes('gsap')) return 'gsap-vendor';
          if (id.includes('ogl')) return 'ogl-vendor';
          return undefined;
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
