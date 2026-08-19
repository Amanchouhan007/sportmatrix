import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false
    },
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/index.css',
        './src/layouts/WebsiteLayout.jsx',
        './src/pages/website/HomePage.jsx',
        './src/pages/website/TurfDetailPage.jsx',
        './src/pages/website/SlotBookingPage.jsx'
      ]
    }
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['react-icons'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['@react-google-maps/api']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'peerjs',
      'recharts',
      '@react-google-maps/api',
      'react-icons/hi',
      'react-icons/fi',
      'react-icons/fa',
      'react-icons/bi',
      'react-icons/io5',
      'react-icons/tb',
      'react-icons/ai',
      'react-icons/md',
      'react-icons/gi',
      'react-icons/ri',
      'react-icons/bs'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  }
})

