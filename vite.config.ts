import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        // Critical components require higher coverage
        'src/features/sales/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        'src/features/inventory/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        'src/features/customers/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
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
