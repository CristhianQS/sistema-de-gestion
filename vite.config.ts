import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Librerías que cambian poco: en chunks propios, el navegador las mantiene
// en caché entre despliegues aunque cambie el código de la app.
const VENDOR_CHUNKS: Record<string, string[]> = {
  'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
  'vendor-supabase': ['@supabase'],
  'vendor-query': ['@tanstack'],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          const pkg = id.split('node_modules/').pop()!
          for (const [chunk, prefixes] of Object.entries(VENDOR_CHUNKS)) {
            if (prefixes.some((p) => pkg === p || pkg.startsWith(`${p}/`))) return chunk
          }
        },
      },
    },
  },
})
