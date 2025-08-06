# 🧪 Guia de Testes - Adega Manager

**Versão:** v2.0.0  
**Data:** 4 de Agosto de 2025  
**Status:** Sistema em Produção com 925+ registros reais

## 📋 Visão Geral

Este documento fornece orientações completas sobre como executar, escrever e manter testes no **Adega Manager** - um sistema enterprise de gestão de adegas em produção ativa.

## 🚀 Como Executar Testes

### Comandos Essenciais

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes uma vez (CI/CD)
npm run test:run

# Executar testes com interface visual
npm run test:ui

# Executar testes com cobertura
npm run test:coverage
```

### Executar Testes Específicos

```bash
# Executar arquivo específico
npm test -- src/hooks/use-cart.test.ts

# Executar por padrão
npm test -- --grep "should calculate total"

# Executar testes de performance
npm test -- src/__tests__/performance/

# Executar testes de acessibilidade
npm test -- src/__tests__/accessibility/
```

## 📊 Cobertura de Código

### Thresholds Configurados

```typescript
// vitest.config.ts
coverage: {
  threshold: {
    global: {
      branches: 70,    // 70% das branches cobertas
      functions: 80,   // 80% das funções cobertas
      lines: 80,       // 80% das linhas cobertas
      statements: 80   // 80% dos statements cobertos
    }
  }
}
```

### Como Interpretar Relatórios

**Relatório HTML:** `coverage/index.html`
- 🟢 Verde: Cobertura adequada (>= threshold)
- 🟡 Amarelo: Cobertura parcial (50-79%)
- 🔴 Vermelho: Cobertura insuficiente (<50%)

**Arquivos Excluídos:**
- `src/**/*.d.ts` - Definições TypeScript
- `src/**/*.stories.ts` - Storybook stories
- `src/**/*.test.ts` - Arquivos de teste
- `src/core/api/supabase/types.ts` - Types auto-gerados

## 🛠️ Estrutura de Testes

### Organização de Arquivos

```
src/
├── __tests__/                    # Testes globais
│   ├── accessibility/            # Testes de acessibilidade
│   ├── performance/              # Testes de performance
│   └── utils/                    # Utilities de teste
├── features/
│   └── [feature]/
│       ├── hooks/
│       │   └── __tests__/        # Testes de hooks
│       └── components/
│           └── __tests__/        # Testes de componentes
└── shared/
    └── hooks/
        └── __tests__/            # Testes de hooks compartilhados
```

### Padrões de Nomenclatura

```typescript
// ✅ Correto
describe('useCart', () => {
  it('should add item to cart', () => {})
  it('should calculate total correctly', () => {})
  it('should handle empty cart', () => {})
})

// ❌ Incorreto
describe('Cart Tests', () => {
  test('adding items', () => {})
  it('totals', () => {})
})
```

## 📝 Como Escrever Novos Testes

### 1. Testes de Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCart } from '../use-cart'

describe('useCart', () => {
  it('should add item to cart successfully', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.totalItems).toBe(2)
  })
})
```

### 2. Testes de Componentes

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@/__tests__/utils/test-utils'
import { ProductForm } from '../ProductForm'

describe('ProductForm', () => {
  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <ProductForm onSubmit={jest.fn()} />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })
})
```

### 3. Testes de Performance

```typescript
describe('Performance Tests', () => {
  it('should render 1000 items in less than 500ms', () => {
    const startTime = performance.now()
    
    render(<ProductList items={largeDataset} />)
    
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(500)
  })
})
```

### 4. Testes de Acessibilidade

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

## 🎯 Padrões e Convenções

### Mocks e Utilities

**Usar Test Wrapper:**
```typescript
// ✅ Sempre usar para componentes
render(
  <TestWrapper>
    <MyComponent />
  </TestWrapper>
)
```

**Mocks Consistentes:**
```typescript
// Mock do Supabase (padrão)
vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}))

// Mock do useToast (padrão)
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))
```

### Estrutura de Teste

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Funcionalidade Principal', () => {
    it('should do something specific', () => {
      // Arrange
      // Act  
      // Assert
    })
  })

  describe('Edge Cases', () => {
    it('should handle error case', () => {})
  })

  describe('Performance', () => {
    it('should perform within limits', () => {})
  })
})
```

## 🔧 Troubleshooting Comum

### Problemas Frequentes

**1. Testes Falhando por Timeout**
```typescript
// ✅ Solução: Aumentar timeout
it('should complete operation', async () => {
  // ...
}, 10000) // 10 segundos
```

**2. Problemas com React Query**
```typescript
// ✅ Usar QueryClient nos testes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})
```

**3. Elementos não Encontrados**
```typescript
// ❌ Incorreto
expect(screen.getByText('Loading')).toBeInTheDocument()

// ✅ Correto - aguardar elemento
await waitFor(() => {
  expect(screen.getByText('Loading')).toBeInTheDocument()
})
```

**4. Testes de Performance Inconsistentes**
```typescript
// ✅ Usar médias e permitir margem
const times = []
for (let i = 0; i < 5; i++) {
  const start = performance.now()
  // operação
  times.push(performance.now() - start)
}
const avgTime = times.reduce((a, b) => a + b) / times.length
expect(avgTime).toBeLessThan(100)
```

### Debug de Testes

```bash
# Executar teste específico com logs
npm test -- --reporter=verbose src/hooks/use-cart.test.ts

# Debug com interface
npm run test:ui

# Ver estrutura DOM
screen.debug() // no teste
```

## 📈 Quando Adicionar Novos Testes

### Obrigatório Adicionar Testes

1. **Nova funcionalidade financeira** (vendas, estoque, pagamentos)
2. **Novos hooks** que gerenciam estado
3. **Componentes de formulário** com validação
4. **Operações críticas** que afetam dados em produção
5. **Correção de bugs** (teste de regressão)

### Tipos de Teste por Cenário

| Cenário | Tipo de Teste | Exemplo |
|---------|---------------|---------|
| Hook de estado | Hook Test | `useCart.test.ts` |
| Componente UI | Component Test | `ProductForm.test.tsx` |
| Fluxo completo | Integration Test | `checkout-flow.test.ts` |
| Performance crítica | Performance Test | `large-dataset.perf.test.ts` |
| Acessibilidade | Accessibility Test | `form.a11y.test.tsx` |

## 🚨 Alertas e Limites

### Limites de Performance

- **Renderização**: < 500ms para 1000 items
- **Hook operations**: < 100ms para operações básicas
- **Memory usage**: < 50MB growth por operação
- **Dom complexity**: < 3000 elementos para listas grandes

### Quality Gates

- **Coverage mínimo**: 80% lines, 70% branches
- **Testes passando**: 100% (zero falhas permitidas)
- **Performance**: Dentro dos limites estabelecidos
- **Acessibilidade**: Zero violações WCAG 2.1 AA

## 🔄 Manutenção de Testes

### Revisão Mensal

1. **Analisar testes flaky** (> 5% failure rate)
2. **Verificar performance** dos testes
3. **Atualizar dependencies** de teste
4. **Remover testes obsoletos**

### Métricas a Acompanhar

- Taxa de sucesso dos testes
- Tempo médio de execução
- Cobertura de código
- Número de testes por categoria

## 💡 Dicas Avançadas

### Otimização de Performance

```typescript
// ✅ Usar describe.concurrent para testes independentes
describe.concurrent('Independent tests', () => {
  it.concurrent('test 1', async () => {})
  it.concurrent('test 2', async () => {})
})

// ✅ Cleanup adequado
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

### Testes Mais Efetivos

```typescript
// ✅ Testar comportamento, não implementação
it('should show error message when validation fails', () => {
  // Foca no resultado visível ao usuário
})

// ❌ Testar detalhes internos
it('should call validation function', () => {
  // Muito acoplado à implementação
})
```

---

## 📞 Suporte

**Em caso de dúvidas:**
1. Consulte este guia primeiro
2. Verifique exemplos nos testes existentes
3. Analise a configuração em `vitest.config.ts`
4. Revise os test utilities em `src/__tests__/utils/`

**Lembre-se:** Estamos testando um sistema em **produção ativa** com **925+ registros reais**. A qualidade dos testes impacta diretamente a confiabilidade do sistema em produção.