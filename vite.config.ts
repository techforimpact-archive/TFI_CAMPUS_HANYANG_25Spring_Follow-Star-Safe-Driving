// vite.config.ts - 완전 수정 버전
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('howler')) {
              return 'audio-vendor';
            }
            return 'vendor';
          }
          
          if (id.includes('/pages/quest/')) {
            return 'quest-pages';
          }
          if (id.includes('/pages/ResultScreen/')) {
            return 'result-pages';
          }
          if (id.includes('/utils/') || id.includes('/hooks/')) {
            return 'utils';
          }
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          if (/mp3|wav|ogg/i.test(extType)) {
            return `assets/sounds/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    
    sourcemap: false,
    assetsInlineLimit: 4096
  },
  
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['.ngrok-free.app'],
    hmr: {
      overlay: false
    }
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion'
    ]
  },
  
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.webp',
    '**/*.mp3',
    '**/*.wav',
    '**/*.ogg',
    '**/*.woff',
    '**/*.woff2'
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@assets': resolve(__dirname, 'public/assets')
    }
  },
  
  css: {
    devSourcemap: false
  },
  
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return `/${filename}`;
      }
      return { relative: true };
    }
  }
})