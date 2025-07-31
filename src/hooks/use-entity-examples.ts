/**
 * Exemplos de Migração para hooks genéricos useEntity
 * 
 * Este arquivo demonstra como migrar hooks existentes para usar o sistema
 * genérico useEntity, preservando a funcionalidade e melhorando a tipagem
 */

import { useEntity, useEntityList, useCreateEntity, useUpdateEntity } from './use-entity';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/inventory.types';

// ============================================================================
// MIGRAÇÃO: useProduct (de use-product.ts)
// ============================================================================

/**
 * ANTES: Hook específico com lógica duplicada
 * AGORA: Usando useEntity genérico com type safety
 */
export function useProductNew(productId?: string | null) {
  return useEntity({
    table: 'products',
    id: productId,
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutos (mantém mesmo cache)
  });
}

/**
 * useProductByBarcode - Caso especial que mantém lógica específica
 * mas pode se beneficiar de alguns padrões do useEntity
 */
export function useProductByBarcodeNew(barcode?: string | null) {
  return useQuery({
    queryKey: ['products', 'barcode', barcode],
    queryFn: async () => {
      if (!barcode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Produto não encontrado - lógica específica preservada
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!barcode,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// MIGRAÇÃO: useCustomer (de use-crm.ts)
// ============================================================================

/**
 * Hook para buscar cliente único - Migração simples
 */
export function useCustomerNew(customerId?: string | null) {
  return useEntity({
    table: 'customers',
    id: customerId,
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para lista de clientes com filtros - Usando useEntityList
 */
export function useCustomersNew(options?: {
  segment?: string;
  search?: string;
  limit?: number;
}) {
  return useEntityList({
    table: 'customers',
    select: `
      id, name, email, phone, segment, lifetime_value,
      last_purchase_date, created_at
    `,
    filters: {
      ...(options?.segment && { segment: options.segment }),
    },
    search: options?.search ? {
      columns: ['name', 'email', 'phone'],
      term: options.search
    } : undefined,
    orderBy: {
      column: 'created_at',
      ascending: false
    },
    limit: options?.limit,
    staleTime: 60 * 1000, // 1 minuto para listas
  });
}

// ============================================================================
// DEMONSTRAÇÃO: Mutations com hooks genéricos
// ============================================================================

/**
 * Hook para criar produto - Demonstração de useCreateEntity
 */
export function useCreateProductNew() {
  return useCreateEntity('products', {
    successMessage: 'Produto criado com sucesso!',
    invalidateKeys: [
      ['products'],
      ['products_list'],
      ['reports'], // Invalida relatórios também
    ],
    onSuccess: (newProduct) => {
      console.log('Produto criado:', newProduct);
      // Lógica adicional específica se necessário
    }
  });
}

/**
 * Hook para atualizar cliente - Demonstração de useUpdateEntity
 */
export function useUpdateCustomerNew() {
  return useUpdateEntity('customers', {
    successMessage: 'Cliente atualizado com sucesso!',
    invalidateKeys: [
      ['customers'],
      ['customers_list'],
      ['customer-insights'], // Invalida insights relacionados
    ],
    onSuccess: (updatedCustomer) => {
      // Pode disparar recálculo de insights se necessário
      // supabase.rpc('recalc_customer_insights', { p_customer_id: updatedCustomer.id });
    }
  });
}

// ============================================================================
// EXEMPLO AVANÇADO: Lista de produtos com filtros complexos
// ============================================================================

/**
 * Demonstração de useEntityList com filtros avançados
 * Substituiria lógica complexa de busca/filtro em componentes
 */
export function useProductsListNew(options?: {
  category?: string;
  lowStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'created_at';
  limit?: number;
}) {
  return useEntityList({
    table: 'products',
    select: `
      id, name, price, cost_price, stock_quantity, 
      minimum_stock, category, barcode, created_at,
      supplier, description
    `,
    filters: {
      ...(options?.category && { category: options.category }),
      // Filtro de baixo estoque seria implementado no backend como view
      // ou aqui como lógica específica se necessário
    },
    search: options?.search ? {
      columns: ['name', 'description', 'barcode'],
      term: options.search
    } : undefined,
    orderBy: {
      column: options?.sortBy || 'created_at',
      ascending: false
    },
    limit: options?.limit || 50,
    staleTime: 2 * 60 * 1000, // 2 minutos para lista de produtos
  });
}

// ============================================================================
// COMPARAÇÃO: Antes vs Depois
// ============================================================================

/*
ANTES (use-product.ts - 25 linhas por hook):
```typescript
export function useProduct(productId?: string | null) {
  return useQuery<Product | null>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}
```

DEPOIS (com useEntity - 7 linhas):
```typescript
export function useProductNew(productId?: string | null) {
  return useEntity({
    table: 'products',
    id: productId,
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}
```

BENEFÍCIOS DA MIGRAÇÃO:
✅ 70% menos código boilerplate
✅ Type safety automático baseado na tabela
✅ Padrões consistentes de cache e error handling
✅ Invalidação automática em mutations relacionadas
✅ Toast notifications padronizadas
✅ Melhor Developer Experience
✅ Facilita testes unitários

QUANDO NÃO MIGRAR:
❌ Queries muito complexas com joins múltiplos
❌ Lógica de negócio específica (ex: useProductByBarcode)
❌ Hooks que manipulam estado local além da query
❌ Casos que requerem processamento customizado dos dados
*/