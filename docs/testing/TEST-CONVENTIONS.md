# 📋 Convenções de Teste - Adega Manager

**Versão:** v2.0.0  
**Última Atualização:** 4 de Agosto de 2025  
**Objetivo:** Padronizar escrita e manutenção de testes

## 🎯 Filosofia de Testes

### Princípios Fundamentais

1. **Testes como Documentação**: Cada teste deve explicar o comportamento esperado do sistema
2. **Proteção Financeira**: Priorizar testes para operações que envolvem dinheiro
3. **Realismo**: Usar dados próximos aos 925+ registros reais em produção
4. **Manutenibilidade**: Escrever testes que evoluem com o código

## 📁 Estrutura e Organização

### Hierarquia de Diretórios

```
src/
├── __tests__/                           # Testes globais e cross-cutting
│   ├── accessibility/                   # Testes WCAG 2.1 AA
│   │   └── *.accessibility.test.tsx
│   ├── performance/                     # Benchmarks e stress tests
│   │   └── *.performance.test.ts
│   ├── integration/                     # Testes de fluxo completo
│   │   └── *.integration.test.ts
│   └── utils/                          # Test utilities e mocks
│       ├── test-utils.tsx              # TestWrapper e helpers
│       ├── mock-data.ts               # Dados de teste realistas
│       └── custom-matchers.ts         # Matchers customizados
├── features/[feature]/
│   ├── hooks/__tests__/               # Testes de lógica de negócio
│   │   └── *.test.ts
│   └── components/__tests__/          # Testes de componentes React
│       └── *.test.tsx
└── shared/
    └── hooks/__tests__/               # Testes de hooks reutilizáveis
        └── *.test.ts
```

### Convenções de Nomenclatura

#### Arquivos de Teste

```
✅ Correto:
- use-cart.test.ts              (hook)
- ProductForm.test.tsx          (component)
- checkout-flow.integration.test.ts (integration)
- table.performance.test.tsx    (performance)
- form.accessibility.test.tsx   (accessibility)

❌ Incorreto:
- cart-tests.ts
- ProductForm.spec.tsx
- test-checkout.ts
- table-perf.tsx
```

#### Estrutura de Describe/It

```typescript
// ✅ Padrão recomendado
describe('useCart', () => {
  describe('adding items', () => {
    it('should add single item to empty cart', () => {})
    it('should add multiple items and calculate total', () => {})
    it('should handle duplicate items by updating quantity', () => {})
  })

  describe('removing items', () => {
    it('should remove item completely when quantity is 1', () => {})
    it('should decrease quantity when quantity > 1', () => {})
    it('should handle removing non-existent item gracefully', () => {})
  })

  describe('edge cases', () => {
    it('should handle invalid product data', () => {})
    it('should handle negative quantities', () => {})
    it('should handle concurrent operations', () => {})
  })

  describe('performance', () => {
    it('should handle 1000+ items without performance degradation', () => {})
  })
})
```

## 🔧 Padrões de Implementação

### Estrutura de Teste (AAA Pattern)

```typescript
it('should calculate correct total with multiple items', () => {
  // Arrange - Preparar dados e estado
  const { result } = renderHook(() => useCart())
  const product1 = createMockProduct({ price: 10.50 })
  const product2 = createMockProduct({ price: 15.75 })

  // Act - Executar a ação
  act(() => {
    result.current.addItem(product1, 2)
    result.current.addItem(product2, 1)
  })

  // Assert - Verificar resultado
  expect(result.current.totalPrice).toBe(36.75)
  expect(result.current.totalItems).toBe(3)
})
```

### Mocks Padronizados

#### Mock do Supabase

```typescript
// Template padrão para todos os testes
const mockSupabaseSelect = vi.fn()
const mockSupabaseInsert = vi.fn()
const mockSupabaseUpdate = vi.fn()
const mockSupabaseDelete = vi.fn()

vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      delete: mockSupabaseDelete,
      eq: vi.fn(() => ({ 
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}))
```

#### Mock do useToast

```typescript
// Template padrão
const mockToast = vi.fn()
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

// Verificação padrão
expect(mockToast).toHaveBeenCalledWith({
  title: expect.any(String),
  description: expect.any(String),
  variant: 'destructive' // ou 'default'
})
```

### Test Wrappers

```typescript
// Sempre usar TestWrapper para componentes
render(
  <TestWrapper>
    <ComponentUnderTest />
  </TestWrapper>
)

// Para testes que precisam de props específicas no wrapper
render(
  <TestWrapper queryClient={customQueryClient}>
    <ComponentUnderTest />
  </TestWrapper>
)
```

## 📊 Dados de Teste

### Criação de Mock Data

```typescript
// ✅ Usar factory functions
export const createMockProduct = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Vinho Tinto Premium',
  price: 89.90,
  stock: 50,
  category: 'Vinhos',
  barcode: '1234567890123',
  supplier: 'Vinícola Premium',
  created_at: new Date().toISOString(),
  ...overrides
})

// ✅ Dados realistas baseados na produção
export const createMockCustomer = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 99999-9999',
  segment: 'HIGH_VALUE',
  total_purchases: 1250.50,
  last_purchase: '2025-08-01',
  ...overrides
})
```

### Datasets para Performance Tests

```typescript
// Para testes de performance - datasets grandes
export const createLargeProductDataset = (size = 1000) => 
  Array.from({ length: size }, (_, i) => createMockProduct({
    id: `product-${i}`,
    name: `Produto ${i}`,
    price: 10 + (i % 100),
    stock: 100 - (i % 50)
  }))
```

## 🧪 Padrões por Tipo de Teste

### Testes de Hooks

```typescript
describe('useProductValidation', () => {
  it('should validate required fields', () => {
    const { result } = renderHook(() => useProductValidation())
    
    const validation = result.current.validate({
      name: '',
      price: null
    })
    
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('Name is required')
    expect(validation.errors).toContain('Price is required')
  })
})
```

### Testes de Componentes

```typescript
describe('ProductForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn()
    
    render(
      <TestWrapper>
        <ProductForm onSubmit={onSubmit} />
      </TestWrapper>
    )
    
    await userEvent.type(screen.getByLabelText(/name/i), 'New Product')
    await userEvent.type(screen.getByLabelText(/price/i), '50.00')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'New Product',
      price: 50.00
    })
  })
})
```

### Testes de Performance

```typescript
describe('ProductList Performance', () => {
  it('should render 1000 products under performance threshold', () => {
    const products = createLargeProductDataset(1000)
    
    const startTime = performance.now()
    render(<ProductList products={products} />)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(500) // 500ms threshold
    expect(screen.getAllByTestId(/product-item/)).toHaveLength(1000)
  })
})
```

### Testes de Acessibilidade

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

describe('ProductForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <ProductForm />
      </TestWrapper>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support keyboard navigation', async () => {
    render(<TestWrapper><ProductForm /></TestWrapper>)
    
    const nameInput = screen.getByLabelText(/name/i)
    const priceInput = screen.getByLabelText(/price/i)
    const submitButton = screen.getByRole('button', { name: /save/i })
    
    await userEvent.tab()
    expect(nameInput).toHaveFocus()
    
    await userEvent.tab()
    expect(priceInput).toHaveFocus()
    
    await userEvent.tab()
    expect(submitButton).toHaveFocus()
  })
})
```

## 🚀 Otimizações e Performance

### Testes Concorrentes

```typescript
// ✅ Para testes independentes
describe.concurrent('Independent validation tests', () => {
  it.concurrent('should validate email format', async () => {})
  it.concurrent('should validate phone format', async () => {})
  it.concurrent('should validate required fields', async () => {})
})
```

### Cleanup Adequado

```typescript
describe('ComponentWithSideEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })
})
```

### Timeouts Apropriados

```typescript
// ✅ Para operações que podem demorar
it('should complete complex calculation', async () => {
  // teste que pode demorar até 5 segundos
}, 5000)

// ✅ Para testes de performance
it('should render within time limit', () => {
  // teste que deve ser rápido
}, 1000)
```

## 📝 Comentários e Documentação

### Quando Comentar

```typescript
// ✅ Explicar lógica complexa
it('should handle concurrent cart operations without race conditions', async () => {
  // Simula múltiplos usuários adicionando items simultaneamente
  // para verificar se o estado permanece consistente
  const promises = Array.from({ length: 10 }, (_, i) => 
    act(() => result.current.addItem(createMockProduct({ id: `${i}` }), 1))
  )
  
  await Promise.all(promises)
  
  expect(result.current.items).toHaveLength(10)
})

// ✅ Explicar edge cases
it('should handle malformed product data gracefully', () => {
  // Teste para dados corrompidos que podem vir da API
  const malformedProduct = { price: 'invalid', stock: -1 }
  
  expect(() => {
    result.current.addItem(malformedProduct, 1)
  }).not.toThrow()
})
```

### Descrições Claras

```typescript
// ✅ Descrições específicas e claras
it('should display validation error when product name exceeds 100 characters', () => {})
it('should calculate 10% discount for customers with HIGH_VALUE segment', () => {})
it('should prevent checkout when cart total exceeds customer credit limit', () => {})

// ❌ Descrições vagas
it('should validate input', () => {})
it('should work correctly', () => {})
it('should handle edge case', () => {})
```

## ⚠️ Erros Comuns a Evitar

### Testes Frágeis

```typescript
// ❌ Dependente de implementação interna
expect(mockFunction).toHaveBeenCalledTimes(1)

// ✅ Foca no comportamento observável
expect(screen.getByText('Item added to cart')).toBeInTheDocument()
```

### Testes Não Determinísticos

```typescript
// ❌ Pode falhar aleatoriamente
expect(Date.now()).toBe(expectedTimestamp)

// ✅ Controla o tempo nos testes
vi.useFakeTimers()
vi.setSystemTime(new Date('2025-08-04'))
```

### Dados Hardcoded

```typescript
// ❌ Dados fixos que podem quebrar
expect(result.products).toHaveLength(5)

// ✅ Usa factory e verifica comportamento
const products = createMockProducts(5)
expect(result.products).toHaveLength(products.length)
```

## 📈 Métricas e Qualidade

### Cobertura por Categoria

- **Hooks de negócio**: 90%+ (crítico)
- **Componentes de formulário**: 85%+ (alta prioridade)
- **Utilities**: 80%+ (média prioridade)
- **Componentes de UI pura**: 70%+ (baixa prioridade)

### Performance Benchmarks

- **Hook operations**: < 100ms
- **Component render**: < 500ms para datasets grandes
- **Integration flows**: < 2s para fluxos completos
- **Memory usage**: < 50MB growth por operação

---

## 🎯 Checklist para Novos Testes

Antes de submeter novos testes, verificar:

- [ ] Nomeclatura segue as convenções
- [ ] Usa TestWrapper quando necessário
- [ ] Mocks seguem os padrões estabelecidos
- [ ] Testa comportamento, não implementação
- [ ] Inclui casos de edge
- [ ] Performance dentro dos limites
- [ ] Cleanup adequado (beforeEach/afterEach)
- [ ] Descriptions claras e específicas
- [ ] Dados realistas (factory functions)
- [ ] Acessibilidade testada (se aplicável)

**Lembre-se**: Estes testes protegem um sistema em produção com 925+ registros reais. A qualidade dos testes impacta diretamente a confiabilidade do negócio.