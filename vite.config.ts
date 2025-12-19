import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  optimizeDeps: {
    include: [
      // Core
      'react',
      'react-dom',
      'react-router-dom',

      // Backend
      '@supabase/supabase-js',
      '@tanstack/react-query',
      '@tanstack/react-virtual',

      // Charts
      'recharts',

      // Animations
      'framer-motion',

      // Forms
      'react-hook-form',
      'zod',
      '@hookform/resolvers',

      // Radix UI
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-popover',
      '@radix-ui/react-avatar',
      '@radix-ui/react-accordion',
      '@radix-ui/react-switch',

      // Icons
      'lucide-react',

      // Utils
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
    force: false,  // Primeira vez: true. Depois mudar para false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core essencial
          'vendor': ['react', 'react-dom', 'react-router-dom'],

          // Charts heavy - PRECISA SER SEPARADO
          'charts': ['recharts', '@tanstack/react-table'],

          // UI components - Radix UI separado
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            'lucide-react'
          ],

          // Backend integration
          'supabase': [
            '@supabase/supabase-js',
            '@tanstack/react-query'
          ]
        }
      }
    }
  },
}));
