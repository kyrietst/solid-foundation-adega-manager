# Changelog v3.1.2 - Customer Table Data Quality Fixes

**Data de Release**: 16/10/2025
**Tipo**: Patch (Bug Fixes + Data Quality Improvements)
**Impacto**: Médio - Correções críticas em cálculos de completude e método preferido

---

## 🎯 Resumo Executivo

Versão focada em **correções de qualidade de dados** na tabela de clientes (CustomerDataTable), resolvendo inconsistências no cálculo de completude de perfil, método de pagamento preferido e formatação de datas.

**Principais Entregas:**
- ✅ Completude de perfil calculada corretamente (43% → 50% para clientes com favorite_product)
- ✅ Método preferido agora considera apenas vendas completed (PIX vs Cartão corrigido)
- ✅ Padronização de formatação de datas entre "Última Compra" e "Último Contato"
- ✅ Correção de lint (regex escape desnecessário removido)

---

## 🐛 Bug Fixes

### 1. **Completude de Perfil - Campos Faltantes na Query**

**Problema:**
- Campos `favorite_product` (peso 7) e `purchase_frequency` (peso 15) não eram buscados na query
- Sistema `completeness-calculator.ts` esperava esses campos para cálculo
- Resultava em completude 7% menor que o real para clientes com favorite_product

**Causa Raiz:**
```typescript
// ❌ ANTES: Query incompleta
.select(`
  ...
  favorite_category,
  // favorite_product - FALTANDO
  // purchase_frequency - FALTANDO
  segment,
  ...
`)
```

**Solução:**
```typescript
// ✅ DEPOIS: Query completa
.select(`
  ...
  favorite_category,
  favorite_product,      // ✅ ADICIONADO
  purchase_frequency,    // ✅ ADICIONADO
  segment,
  ...
`)
```

**Exemplo Real - Andressa Silva:**
- **Antes:** 43% (phone: 20 + address: 15 + favorite_category: 8 = 43/100)
- **Depois:** 50% (phone: 20 + address: 15 + favorite_category: 8 + favorite_product: 7 = 50/100)

**Arquivo:** `src/features/customers/hooks/useCustomerTableData.ts:249-250`

---

### 2. **Método Preferido - Contagem Incluía Vendas Pending**

**Problema:**
- Query contava TODAS as vendas para determinar método preferido
- Incluía vendas com status `pending` que ainda não foram concretizadas
- Resultado: método preferido não refletia comportamento real do cliente

**Causa Raiz:**
```typescript
// ❌ ANTES: Conta todas as vendas
const { data: salesData } = await supabase
  .from('sales')
  .select('payment_method')
  .eq('customer_id', customer.id)
  // .eq('status', 'completed') - FALTANDO
  .not('payment_method', 'is', null);
```

**Solução:**
```typescript
// ✅ DEPOIS: Conta apenas vendas concluídas
const { data: salesData } = await supabase
  .from('sales')
  .select('payment_method')
  .eq('customer_id', customer.id)
  .eq('status', 'completed')  // ✅ ADICIONADO
  .not('payment_method', 'is', null);
```

**Exemplo Real - Andressa Silva:**
- **Vendas Totais:** 25 (10 PIX completed, 1 PIX pending, 14 Cartão pending)
- **Antes:** "Cartão" (14 pending vs 11 PIX total)
- **Depois:** "PIX" (10 completed vs 0 Cartão completed)

**Arquivo:** `src/features/customers/hooks/useCustomerTableData.ts:271`

---

### 3. **Formatação de Datas - Inconsistência entre Colunas**

**Problema:**
- Coluna "Última Compra": formatava como "3 semanas atrás"
- Coluna "Último Contato": formatava como "25 dias atrás"
- Mesmo intervalo de tempo (25 dias), formatações diferentes
- Confusão para usuários ao comparar as duas colunas

**Causa Raiz:**
```typescript
// ❌ ANTES: Lógica diferente em formatLastContact
export const formatLastContact = (date: Date | null, daysAgo: number | null): string => {
  if (!date || daysAgo === null) return 'Nunca';

  if (daysAgo === 0) return 'Hoje';
  if (daysAgo === 1) return 'Ontem';
  if (daysAgo <= 7) return `${daysAgo} dias atrás`;
  if (daysAgo <= 30) return `${daysAgo} dias atrás`;  // ❌ Sempre "X dias"

  return date.toLocaleDateString('pt-BR');
};
```

**Solução:**
```typescript
// ✅ DEPOIS: Mesma lógica de formatLastPurchase
export const formatLastContact = (date: Date | null, daysAgo: number | null): string => {
  if (!date || daysAgo === null) return 'Nunca';

  // Usar mesma lógica de formatLastPurchase para consistência
  if (daysAgo === 0) return 'Hoje';
  if (daysAgo === 1) return 'Ontem';
  if (daysAgo < 7) return `${daysAgo} dias atrás`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} semanas atrás`;  // ✅ Padronizado
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} meses atrás`;

  return date.toLocaleDateString('pt-BR');
};
```

**Exemplo Real - Andressa Silva (25 dias atrás):**
- **Antes:**
  - Última Compra: "3 semanas atrás"
  - Último Contato: "25 dias atrás"
- **Depois:**
  - Última Compra: "3 semanas atrás"
  - Último Contato: "3 semanas atrás" ✅

**Arquivo:** `src/features/customers/types/customer-table.types.ts:177-188`

---

### 4. **Lint Error - Escape Desnecessário em Regex**

**Problema:**
- ESLint error: "Unnecessary escape character: \\/"
- Regex tinha `[\\/]` quando `[/]` já seria suficiente

**Solução:**
```typescript
// ❌ ANTES
const match = address.match(/([A-Za-zÀ-ÿ\s]+)[\\/]([A-Z]{2})/);

// ✅ DEPOIS
const match = address.match(/([A-Za-zÀ-ÿ\s]+)[/-]([A-Z]{2})/);
```

**Arquivo:** `src/features/customers/hooks/useCustomerTableData.ts:84`

---

## 📊 Impacto das Correções

### Dados Afetados
- **Clientes com favorite_product:** Completude aumenta em 7%
- **Clientes com vendas pending:** Método preferido pode mudar
- **Todos os clientes:** Formatação de datas padronizada

### Exemplo Completo - Andressa Silva

| Campo | Antes | Depois | Mudança |
|-------|-------|--------|---------|
| **Completude** | 43% | **50%** | +7% ✅ |
| **Método Preferido** | Cartão | **PIX** | Corrigido ✅ |
| **Último Contato** | "25 dias atrás" | **"3 semanas atrás"** | Padronizado ✅ |

---

## 🔧 Arquivos Modificados

1. **src/features/customers/hooks/useCustomerTableData.ts**
   - Linha 249-250: Adicionados `favorite_product` e `purchase_frequency` ao SELECT
   - Linha 271: Adicionado filtro `.eq('status', 'completed')`
   - Linha 84: Corrigido escape desnecessário em regex

2. **src/features/customers/types/customer-table.types.ts**
   - Linhas 177-188: Padronizada função `formatLastContact`

---

## ✅ Validação

### Testes Realizados
- ✅ Lint passou sem novos erros
- ✅ Build TypeScript compilou com sucesso
- ✅ Dados de Andressa Silva validados com banco de produção
- ✅ Comparação visual confirmada com screenshot

### Casos de Teste
1. **Cliente com favorite_product:** Completude aumenta corretamente
2. **Cliente com vendas pending:** Método preferido considera apenas completed
3. **Cliente sem vendas:** Método preferido mostra "Sem histórico"
4. **Formatação de datas:** Consistência entre todas as colunas

---

## 📝 Notas de Migração

**Nenhuma ação necessária.** Correções são transparentes para o usuário.

**Possíveis Mudanças Visuais:**
- Alguns clientes terão completude maior (se tiverem favorite_product)
- Método preferido pode mudar para clientes com vendas pending
- Formatação "Último Contato" agora usa semanas/meses ao invés de só dias

---

## 🎯 Próximos Passos

Sugestões para melhorias futuras:
1. Adicionar testes unitários para funções de formatação
2. Criar validação de schema para garantir que todos os campos do `completeness-calculator` são buscados
3. Documentar sistema de pesos da completude de perfil
4. Considerar adicionar badge visual quando há vendas pending

---

**Autor:** Claude + Luccas
**Reviewers:** Equipe Adega Manager
**Status:** ✅ Ready for Production
