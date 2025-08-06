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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries - bibliotecas de terceiros
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Chart libraries - bibliotecas de gráficos
          charts: ['recharts'],
          // UI libraries - bibliotecas de interface
          ui: [
            'lucide-react', 
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast'
          ],
          // Supabase and data libraries - bibliotecas de dados
          supabase: ['@supabase/supabase-js', '@tanstack/react-query'],
          // Utils and helpers - utilitários
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
}));
