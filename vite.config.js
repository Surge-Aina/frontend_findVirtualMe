import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to handle client-side routing
const spaFallback = () => {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Skip API routes and static files
        if (req.url.startsWith('/portfolio/') ||
            req.url.startsWith('/auth/') ||
            req.url.startsWith('/user/') ||
            req.url.startsWith('/settings/') ||
            req.url.startsWith('/uploads/') ||
            req.url.includes('.') ||
            req.url.startsWith('/@') ||
            req.url.startsWith('/node_modules')) {
          return next()
        }

        // For all other routes, serve index.html
        req.url = '/'
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), spaFallback()],
    server: {
        hmr: {
            overlay: false
        },
        proxy: {
            '/portfolio': 'http://localhost:5000',
            '/auth': 'http://localhost:5000',
            '/user': 'http://localhost:5000',
            '/settings': 'http://localhost:5000',
            '/uploads': 'http://localhost:5000'
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    ui: ['framer-motion', 'lucide-react'],
                    utils: ['axios', 'socket.io-client']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})