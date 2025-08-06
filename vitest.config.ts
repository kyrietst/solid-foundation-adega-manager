/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente de teste
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // Globals para evitar imports repetitivos
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.vite/',
        'coverage/',
        // Arquivos específicos que não precisam de cobertura
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/integrations/supabase/types.ts', // Auto-generated
      ],
      // Thresholds mínimos conforme estratégia
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 85,
        statements: 80
      }
    },
    
    // Timeout para testes
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Incluir apenas arquivos de teste
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Excluir arquivos desnecessários
    exclude: [
      'node_modules',
      'dist',
      '.vite',
      'build'
    ],
    
    // Configuração de watch
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    },
    
    // Pool de workers para performance
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  
  // Resolver aliases para testes (mesmo do vite.config.ts)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/features': path.resolve(__dirname, 'src/features'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/core': path.resolve(__dirname, 'src/core'),
      '@/integrations': path.resolve(__dirname, 'src/integrations'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/pages': path.resolve(__dirname, 'src/pages')
    }
  }
})