# 📊 Guia de Cobertura de Código - Adega Manager

**Versão:** v2.0.0  
**Data:** 4 de Agosto de 2025  
**Framework:** Vitest + V8 Coverage Provider

## 🎯 Visão Geral

Este documento explica como interpretar, monitorar e melhorar a cobertura de código no Adega Manager, garantindo qualidade adequada para um sistema em produção com 925+ registros reais.

## ⚙️ Configuração de Coverage

### Thresholds Definidos

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'json', 'json-summary'],
  reportsDirectory: './coverage',
  
  // Thresholds obrigatórios
  threshold: {
    global: {
      branches: 70,      // 70% das branches cobertas
      functions: 80,     // 80% das funções cobertas  
      lines: 80,         // 80% das linhas cobertas
      statements: 80     // 80% dos statements cobertos
    },
    
    // Thresholds específicos para áreas críticas
    'src/hooks/financial/': {
      branches: 85,      // Lógica financeira requer mais cobertura
      functions: 90,
      lines: 90,
      statements: 90
    },
    
    'src/hooks/security/': {
      branches: 80,      // Segurança é crítica
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Exclusões justificadas
  exclude: [
    'src/**/*.d.ts',                    // Definições TypeScript
    'src/**/*.stories.ts',              // Storybook stories
    'src/**/*.test.ts',                 // Arquivos de teste
    'src/**/*.test.tsx',                // Arquivos de teste React
    'src/core/api/supabase/types.ts',   // Types auto-gerados
    'src/**/__tests__/**',              // Diretórios de teste
    'src/__mocks__/**',                 // Mocks globais
    'src/vite-env.d.ts',               // Vite definitions
    'src/main.tsx',                     // Entry point
    'tailwind.config.ts',              // Configuração Tailwind
    'vite.config.ts',                  // Configuração Vite
    'vitest.config.ts'                 // Configuração Vitest
  ]
}
```

## 📈 Como Interpretar Relatórios

### Relatório de Terminal

```bash
npm run test:coverage

# Saída esperada:
✓ src/hooks/use-cart.test.ts (15)
✓ src/components/ProductForm.test.tsx (8)

 Coverage report from v8
--------------------------------|---------|----------|---------|---------|
File                           | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                      |   82.5  |   75.2   |   88.1  |   82.8  |
 src/hooks                     |   91.2  |   85.4   |   95.0  |   91.0  |
  use-cart.ts                  |   95.2  |   90.0   |  100.0  |   95.2  |
  use-auth.ts                  |   87.1  |   80.8   |   90.0  |   87.1  |
 src/components                |   78.5  |   68.9   |   82.1  |   79.2  |
  ProductForm.tsx              |   85.0  |   75.0   |   90.0  |   85.0  |
  CustomerTable.tsx            |   72.0  |   62.8   |   74.2  |   73.5  |
--------------------------------|---------|----------|---------|---------|

✅ Coverage thresholds met
```

### Cores e Significados

- 🟢 **Verde (≥ 80%)**: Cobertura excelente
- 🟡 **Amarelo (70-79%)**: Cobertura adequada, mas pode melhorar
- 🟠 **Laranja (50-69%)**: Cobertura insuficiente, ação necessária
- 🔴 **Vermelho (< 50%)**: Cobertura crítica, prioridade alta

### Relatório HTML

**Local:** `coverage/index.html`

```bash
# Abrir relatório no navegador
open coverage/index.html
# ou
npx serve coverage
```

**Features do Relatório HTML:**
- 📁 Navegação por diretórios
- 📄 Visualização linha por linha
- 🎨 Highlight de código não coberto
- 📊 Gráficos de cobertura por arquivo

## 📊 Métricas Explicadas

### 1. Statements (Declarações)

```typescript
// Exemplo: 4 statements
const price = 10.50;          // Statement 1
const quantity = 2;           // Statement 2  
const total = price * quantity; // Statement 3
return total;                 // Statement 4
```

**Como melhorar:** Adicionar testes que executem todas as linhas de código.

### 2. Branches (Ramificações)

```typescript
// Exemplo: 2 branches
function validateAge(age: number): boolean {
  if (age >= 18) {        // Branch 1: true
    return true;
  }
  return false;           // Branch 2: false
}

// Testes necessários:
it('should return true for age >= 18', () => {
  expect(validateAge(20)).toBe(true)  // Testa branch 1
})

it('should return false for age < 18', () => {
  expect(validateAge(16)).toBe(false) // Testa branch 2
})
```

### 3. Functions (Funções)

```typescript
// Exemplo: 3 functions
export const calculateTax = (amount: number): number => { ... }      // Function 1
export const formatCurrency = (value: number): string => { ... }     // Function 2  
export const validateEmail = (email: string): boolean => { ... }     // Function 3
```

**Como melhorar:** Garantir que todas as funções exportadas sejam testadas.

### 4. Lines (Linhas)

Semelhante aos statements, mas conta linhas físicas no arquivo.

## 🎯 Estratégias para Melhorar Cobertura

### 1. Identificar Áreas Não Cobertas

```bash
# Executar coverage e identificar gaps
npm run test:coverage

# Focar nos arquivos com menor cobertura
# Exemplo: CustomerTable.tsx (72.0%)
```

### 2. Adicionar Testes para Edge Cases

```typescript
// ❌ Cobertura parcial
function calculateDiscount(amount: number, customerType: string): number {
  if (amount > 100) {           // Branch testada
    if (customerType === 'VIP') { // Branch não testada
      return amount * 0.2;
    }
    return amount * 0.1;        // Branch não testada  
  }
  return 0;                     // Branch não testada
}

// ✅ Cobertura completa
describe('calculateDiscount', () => {
  it('should return 20% discount for VIP customers over $100', () => {
    expect(calculateDiscount(150, 'VIP')).toBe(30)
  })
  
  it('should return 10% discount for regular customers over $100', () => {
    expect(calculateDiscount(150, 'regular')).toBe(15)
  })
  
  it('should return 0 discount for amounts under $100', () => {
    expect(calculateDiscount(50, 'VIP')).toBe(0)
  })
})
```

### 3. Testar Error Paths

```typescript
// Garantir que paths de erro sejam testados
try {
  await processPayment(paymentData);  // Success path
} catch (error) {
  logError(error);                    // Error path - precisa de teste
  throw new PaymentError(error.message);
}

// Teste para error path
it('should handle payment processing errors', async () => {
  mockProcessPayment.mockRejectedValue(new Error('Payment failed'))
  
  await expect(handlePayment(paymentData))
    .rejects.toThrow('Payment failed')
})
```

## 📋 Quando Adicionar Novos Testes

### Cenários Obrigatórios

1. **Cobertura abaixo do threshold**
   ```bash
   # Coverage falhou
   ❌ Coverage threshold for lines (80%) not met: 75.2%
   ```

2. **Nova funcionalidade adicionada**
   - Sempre adicionar testes para código novo
   - Manter cobertura global estável

3. **Bug fix implementado**
   - Adicionar teste de regressão
   - Garantir que edge case seja coberto

### Priorização por Criticidade

**Alta Prioridade (90%+ coverage):**
- Hooks financeiros (useCheckout, useCart)
- Hooks de segurança (useAuth, usePermissions)
- Utilities de cálculo monetário

**Média Prioridade (80%+ coverage):**
- Componentes de formulário
- Hooks de estado
- Services de API

**Baixa Prioridade (70%+ coverage):**
- Componentes de apresentação
- Utilities de formatação
- Helpers de UI

## 🔍 Analisando Gaps de Cobertura

### Usando o Relatório HTML

1. **Abrir relatório:** `coverage/index.html`
2. **Navegar para arquivo com baixa cobertura**
3. **Identificar linhas vermelhas (não cobertas)**
4. **Escrever testes específicos**

### Exemplo Prático

```typescript
// Arquivo: src/hooks/use-inventory.ts
// Cobertura atual: 65% (abaixo do threshold)

export const useInventory = () => {
  const calculateTurnover = (product: Product) => {
    if (!product.sales_data) {           // 🔴 Linha não coberta
      return 'UNKNOWN';                  // 🔴 Linha não coberta
    }
    
    const daysInStock = calculateDays(product.created_at);
    const salesVelocity = product.total_sold / daysInStock;
    
    if (salesVelocity > 0.5) {          // 🟢 Linha coberta
      return 'FAST';                    // 🟢 Linha coberta
    } else if (salesVelocity > 0.1) {   // 🔴 Branch não coberta
      return 'MEDIUM';                  // 🔴 Linha não coberta
    }
    return 'SLOW';                      // 🔴 Linha não coberta
  }
}

// Testes necessários para 100% cobertura:
describe('calculateTurnover', () => {
  it('should return UNKNOWN for products without sales data', () => {
    const product = { sales_data: null }
    expect(calculateTurnover(product)).toBe('UNKNOWN')  // Cobre linhas vermelhas
  })
  
  it('should return MEDIUM for moderate sales velocity', () => {
    const product = createMockProduct({ 
      total_sold: 5,
      created_at: subDays(new Date(), 25) // 5/25 = 0.2 velocity
    })
    expect(calculateTurnover(product)).toBe('MEDIUM')   // Cobre branch MEDIUM
  })
  
  it('should return SLOW for low sales velocity', () => {
    const product = createMockProduct({ 
      total_sold: 2,
      created_at: subDays(new Date(), 50) // 2/50 = 0.04 velocity  
    })
    expect(calculateTurnover(product)).toBe('SLOW')     // Cobre branch SLOW
  })
})
```

## 🚨 Exclusões Justificadas

### Arquivos Automaticamente Excluídos

```typescript
// vitest.config.ts - exclude configuration
exclude: [
  'src/**/*.d.ts',                    // ✅ Types apenas - sem lógica
  'src/core/api/supabase/types.ts',   // ✅ Auto-gerado pelo Supabase
  'src/**/__tests__/**',              // ✅ Arquivos de teste
  'src/main.tsx',                     // ✅ Entry point simples
  'tailwind.config.ts',               // ✅ Configuração externa
]
```

### Como Adicionar Exclusões

**⚠️ Cuidado:** Só excluir com justificativa válida

```typescript
// Adicionar ao exclude apenas se:
// 1. Arquivo sem lógica de negócio
// 2. Código gerado automaticamente  
// 3. Configuração pura
// 4. Impossível/impraticável testar

// ❌ Não excluir por dificuldade de teste
// ❌ Não excluir lógica de negócio
// ❌ Não excluir código crítico
```

## 📊 Monitoramento Contínuo

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage
  
- name: Check coverage thresholds
  run: |
    if [ $? -ne 0 ]; then
      echo "❌ Coverage thresholds not met"
      exit 1
    fi
```

### Métricas de Acompanhamento

**Semanalmente:**
- Coverage global por categoria
- Identificar tendências de queda
- Revisar arquivos com baixa cobertura

**Mensalmente:**
- Ajustar thresholds se necessário
- Revisar exclusões
- Atualizar documentação

## 🎯 Objetivos de Coverage

### Metas por Área

| Área | Coverage Atual | Meta 2025 | Justificativa |
|------|----------------|-----------|---------------|
| Financial Hooks | 90% | 95% | Crítico para negócio |
| Security | 85% | 90% | Dados sensíveis |
| Forms | 80% | 85% | Entrada de dados |
| UI Components | 75% | 80% | Experiência do usuário |
| Utilities | 80% | 85% | Funções auxiliares |

### Roadmap de Melhorias

**Q3 2025:**
- [ ] Melhorar coverage de componentes críticos
- [ ] Implementar testes de integração com coverage
- [ ] Adicionar coverage para error boundaries

**Q4 2025:**
- [ ] Atingir 85% de coverage global
- [ ] Implementar mutation testing
- [ ] Otimizar performance dos testes

## 💡 Dicas Avançadas

### 1. Coverage vs Qualidade

```typescript
// ❌ 100% coverage mas teste inútil
it('should call function', () => {
  const result = myFunction()
  expect(result).toBeDefined()  // Não verifica comportamento
})

// ✅ Coverage menor mas teste útil  
it('should calculate correct tax for Brazilian products', () => {
  const product = { price: 100, country: 'BR' }
  const result = calculateTax(product)
  expect(result).toBe(18.5)     // Verifica lógica específica
})
```

### 2. Branch Coverage Inteligente

```typescript
// Focar em branches que impactam o negócio
function getCustomerDiscount(customer: Customer): number {
  // Branch crítica - impacta receita
  if (customer.totalPurchases > 1000) {    // Testar obrigatório
    return 0.15;
  }
  
  // Branch menos crítica - UI apenas
  if (customer.preferredTheme === 'dark') { // Pode ter coverage menor
    // ... logic
  }
}
```

### 3. Performance vs Coverage

```typescript
// Balancear coverage com performance dos testes
describe('Heavy computation', () => {
  // ✅ Testar casos principais com coverage alto
  it('should handle normal dataset', () => { ... })
  it('should handle edge cases', () => { ... })
  
  // ✅ Testar performance separadamente se necessário
  it('should perform within limits', () => { ... }, 1000)
})
```

---

## 🎯 Checklist de Coverage

Antes de fazer commit:

- [ ] Coverage global ≥ 80%
- [ ] Hooks financeiros ≥ 90%
- [ ] Componentes críticos ≥ 85%
- [ ] Sem arquivos com coverage < 70%
- [ ] Testes focam em comportamento, não apenas coverage
- [ ] Edge cases importantes cobertos
- [ ] Error paths testados

**Lembre-se:** Coverage é uma métrica importante, mas qualidade dos testes é mais importante que porcentagem. O objetivo é proteger um sistema em produção com 925+ registros reais.