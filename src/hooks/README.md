# Hooks Customizados - Adega Manager

Documentação completa dos hooks customizados utilizados no sistema de gerenciamento de adega.

## 📁 Estrutura dos Hooks

```
src/hooks/
├── common/                 # Hooks genéricos reutilizáveis
│   ├── useDialogState.ts   # Gerenciamento de dialogs/modals
│   ├── useErrorHandler.ts  # Tratamento padronizado de erros
│   └── useFilters.ts       # Sistema de filtros genérico
├── crm/                    # Hooks específicos de CRM
│   └── useProfileCompletenessCalculator.ts
├── customers/              # Hooks de gestão de clientes
├── inventory/              # Hooks de gestão de inventário
├── use-cart.ts            # Carrinho de compras (Zustand)
├── use-crm.ts             # CRM principal
├── use-debounce.ts        # Debouncing de inputs
├── use-entity.ts          # Operações CRUD genéricas
├── use-form-with-toast.ts # Formulários com feedback
├── use-pagination.ts      # Paginação reutilizável
└── use-*.ts               # Outros hooks especializados
```

## 🎯 Hooks por Categoria

### 1. Hooks Genéricos (common/)

#### `useDialogState`
Gerenciamento padronizado de estados de dialogs/modals.

```typescript
import { useDialogState, useEntityDialogs } from '@/hooks/common/useDialogState';

// Dialog único
const dialog = useDialogState();
dialog.open(data);
dialog.close();

// Múltiplos dialogs (create, edit, delete, view)
const dialogs = useEntityDialogs<Product>();
dialogs.openCreate();
dialogs.openEdit(product);
```

#### `useErrorHandler`
Tratamento padronizado de erros com toast, retry e logging.

```typescript
import { useErrorHandler, useDatabaseErrorHandler } from '@/hooks/common/useErrorHandler';

const { handleError, handleAsyncError, withErrorHandling } = useErrorHandler();

// Tratar erro simples
handleError(error, { operation: 'create_product' });

// Função assíncrona com retry automático
const result = await handleAsyncError(
  () => api.createProduct(data),
  { operation: 'create_product' },
  { retryable: true, maxRetries: 3 }
);
```

#### `useFilters`
Sistema genérico de filtros com persistência localStorage.

```typescript
import { useProductFilters, useCustomerFilters } from '@/hooks/common/useFilters';

const {
  filters,
  filteredItems,
  updateFilter,
  setSearchTerm,
  resetFilters
} = useProductFilters(products);
```

### 2. Hooks de Negócio

#### `use-crm.ts`
Hook principal para operações de CRM.

```typescript
import { useCustomers, useCustomer, useProfileCompleteness } from '@/hooks/use-crm';

// Lista de clientes
const { data: customers } = useCustomers({ search: 'João', limit: 50 });

// Cliente específico
const { data: customer } = useCustomer(customerId);

// Completude do perfil
const { score, suggestions } = useProfileCompleteness(customer);
```

#### `use-cart.ts`
Gerenciamento do carrinho de compras com Zustand.

```typescript
import { useCart, useCartTotal, useCartStats } from '@/hooks/use-cart';

const { items, addItem, removeItem, clearCart } = useCart();
const total = useCartTotal();
const { itemCount, isEmpty } = useCartStats();
```

#### `use-pagination.ts`
Paginação reutilizável para listas.

```typescript
import { usePagination } from '@/hooks/use-pagination';

const {
  currentPage,
  totalPages,
  paginatedItems,
  nextPage,
  prevPage,
  setCurrentPage
} = usePagination(items, {
  initialItemsPerPage: 12,
  resetPageOnDataChange: true
});
```

### 3. Hooks Especializados

#### `use-entity.ts`
Operações CRUD genéricas para qualquer entidade.

```typescript
import { useEntityList, useEntity, useEntityMutation } from '@/hooks/use-entity';

// Listar entidades
const { data: products } = useEntityList({
  table: 'products',
  filters: { category: 'wine' },
  search: { columns: ['name'], term: 'malbec' }
});

// Entidade específica
const { data: product } = useEntity({ table: 'products', id: productId });

// Mutations
const { create, update, delete: remove } = useEntityMutation('products');
```

## 🔧 Padrões de Uso

### 1. Estrutura Básica de Hook

```typescript
/**
 * Hook para [funcionalidade]
 * @param param - Descrição do parâmetro
 * @returns Objeto com estado e ações
 * @example
 * ```typescript
 * const { data, actions } = useMyHook(params);
 * ```
 */
export const useMyHook = (param: Type) => {
  // Estados
  const [state, setState] = useState(initialState);
  
  // Efeitos
  useEffect(() => {
    // Lógica do efeito
  }, [dependencies]);
  
  // Ações memoizadas
  const action = useCallback((args) => {
    // Lógica da ação
  }, [dependencies]);
  
  return {
    // Estado
    state,
    
    // Ações
    action,
    
    // Computed
    computed: useMemo(() => calculate(state), [state])
  };
};
```

### 2. Error Handling

```typescript
import { useDatabaseErrorHandler } from '@/hooks/common/useErrorHandler';

export const useMyDataHook = () => {
  const { handleAsyncError } = useDatabaseErrorHandler();
  
  const mutation = useMutation({
    mutationFn: (data) => handleAsyncError(
      () => supabase.from('table').insert(data),
      { operation: 'create_record' }
    )
  });
  
  return mutation;
};
```

### 3. React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useMyQuery = (id: string) => {
  return useQuery({
    queryKey: ['my-data', id],
    queryFn: () => fetchData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

## 📊 Performance Guidelines

### 1. Memoização Adequada

```typescript
// ✅ Correto - dependências mínimas
const nextPage = useCallback(() => {
  setCurrentPage(prev => prev + 1);
}, []);

// ❌ Incorreto - dependência desnecessária
const nextPage = useCallback(() => {
  setCurrentPage(currentPage + 1);
}, [currentPage]);
```

### 2. useEffect vs useMemo

```typescript
// ✅ useEffect para side effects
useEffect(() => {
  if (condition) {
    setState(newValue);
  }
}, [condition]);

// ✅ useMemo para cálculos
const computed = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ❌ useMemo para side effect
useMemo(() => {
  setState(newValue); // Incorreto!
}, [condition]);
```

### 3. Seletores Otimizados

```typescript
// ✅ Seletor específico
const total = useCart(state => state.total);

// ❌ Objeto completo (causa re-renders desnecessários)
const cart = useCart();
const total = cart.total;
```

## 🧪 Testing Guidelines

### 1. Testes de Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.state).toBe(expectedInitialState);
  });
  
  it('should update state when action is called', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.action(newValue);
    });
    
    expect(result.current.state).toBe(expectedNewState);
  });
});
```

### 2. Testes com React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

## 📋 Checklist para Novos Hooks

- [ ] **Documentação JSDoc completa**
- [ ] **TypeScript interfaces bem definidas**
- [ ] **Memoização adequada (useCallback, useMemo)**
- [ ] **Dependências corretas nos useEffect**
- [ ] **Error handling implementado**
- [ ] **Testes unitários**
- [ ] **Exemplos de uso**
- [ ] **Performance otimizada**

## 🚀 Migration Guide

### Atualizando Hooks Existentes

1. **Adicionar tipos TypeScript**
2. **Implementar error handling**
3. **Otimizar dependências**
4. **Adicionar documentação**
5. **Criar testes**

### Criando Novos Hooks

1. **Seguir estrutura padrão**
2. **Usar hooks de base (common/)**
3. **Implementar memoização**
4. **Documentar com JSDoc**
5. **Testar adequadamente**

---

**Version:** 2.0.0  
**Last Updated:** Agosto 2025  
**Maintainers:** Adega Manager Team