import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['simplex-noise'],
    force: true
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
          ],
          
          // Utilities
          'utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'zod',
            'react-hook-form'
          ],
          
          // Animations - Framer Motion é pesado
          'animations': [
            'framer-motion',
            'motion'
          ]
        }
      }
    }
  },
}));
