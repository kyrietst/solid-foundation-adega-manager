# Guia de Uso: useCustomerMetrics

**Versão:** 1.0.0
**Data:** 19/10/2025
**Autor:** Equipe Adega Manager

---

## 📋 Índice

1. [O Que É](#o-que-é)
2. [Por Que Existe](#por-que-existe)
3. [Como Usar](#como-usar)
4. [Métricas Disponíveis](#métricas-disponíveis)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Performance e Cache](#performance-e-cache)
7. [Quando Usar vs Não Usar](#quando-usar-vs-não-usar)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 O Que É

`useCustomerMetrics` é um **hook React Query centralizado** que calcula TODAS as métricas de um cliente em um único lugar.

**Localização:** `src/shared/hooks/business/useCustomerMetrics.ts`

**Princípio:** **Single Source of Truth (SSoT)**
- ✅ ÚNICO hook que busca vendas e calcula métricas
- ✅ ÚNICO lugar onde lógica de cálculo existe
- ✅ Todos os outros hooks/componentes consomem daqui

---

## 💡 Por Que Existe

### Problema Antes (v3.3.0 e anteriores)

**Duplicação Massiva:**
```typescript
// useCustomerProfileHeaderSSoT.ts
const { data: sales } = await supabase.from('sales')...
const total = sales.reduce(...)  // ❌ Cálculo duplicado #1

// useCustomerOverviewSSoT.ts
const { data: sales } = await supabase.from('sales')...
const total = sales.reduce(...)  // ❌ Cálculo duplicado #2

// useCustomerActionsSSoT.ts
const { data: sales } = await supabase.from('sales')...
const total = sales.reduce(...)  // ❌ Cálculo duplicado #3
```

**Problemas:**
- ❌ 4+ queries SQL iguais por cliente
- ❌ 800+ linhas de código duplicado
- ❌ Cache fragmentado (query keys diferentes)
- ❌ Possibilidade de valores diferentes entre tabs

### Solução Agora (v3.3.1+)

**Centralização SSoT:**
```typescript
// TODOS os hooks usam o MESMO hook centralizado:
const { data: metrics } = useCustomerMetrics(customerId);
```

**Benefícios:**
- ✅ 1 query SQL por cliente
- ✅ Cache compartilhado
- ✅ Valores sempre iguais
- ✅ Fácil manutenção (1 lugar só)

---

## 🚀 Como Usar

### Uso Básico

```typescript
import { useCustomerMetrics } from '@/shared/hooks/business/useCustomerMetrics';

function MeuComponente({ customerId }: { customerId: string }) {
  const { data: metrics, isLoading, error } = useCustomerMetrics(customerId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!metrics) return null;

  return (
    <div>
      <p>Total de Compras: {metrics.total_purchases}</p>
      <p>Total Gasto: R$ {metrics.total_spent.toFixed(2)}</p>
      <p>Última Compra: {metrics.days_since_last_purchase} dias atrás</p>
    </div>
  );
}
```

### Uso Avançado (com useMemo)

```typescript
import { useCustomerMetrics } from '@/shared/hooks/business/useCustomerMetrics';
import { useMemo } from 'react';

function CustomerInsights({ customerId }: { customerId: string }) {
  const { data: metrics } = useCustomerMetrics(customerId);

  // Derivar estados a partir das métricas
  const isHighValue = useMemo(() => {
    return metrics && metrics.total_spent >= 500 && metrics.total_purchases >= 5;
  }, [metrics]);

  const isAtRisk = useMemo(() => {
    return metrics && (metrics.days_since_last_purchase || 0) > 90;
  }, [metrics]);

  return (
    <div>
      {isHighValue && <Badge variant="gold">Cliente VIP</Badge>}
      {isAtRisk && <Badge variant="warning">Cliente em Risco</Badge>}
    </div>
  );
}
```

---

## 📊 Métricas Disponíveis

### Interface Completa

```typescript
interface CustomerMetrics {
  // === MÉTRICAS DE COMPRAS ===
  total_purchases: number;              // Total de compras (ex: 15)
  total_spent: number;                  // Total gasto (ex: 1250.50)
  lifetime_value_calculated: number;    // LTV = total_spent

  // === MÉTRICAS DE TICKET ===
  avg_purchase_value: number;           // Ticket médio (ex: 83.37)
  avg_items_per_purchase: number;       // Média de itens por compra (ex: 3.2)
  total_products_bought: number;        // Total de produtos comprados (ex: 48)

  // === MÉTRICAS DE RECÊNCIA ===
  last_purchase_real?: string;          // Data última compra ISO (ex: "2025-10-15T10:30:00Z")
  days_since_last_purchase?: number;    // Dias desde última compra (ex: 4)

  // === MÉTRICAS DE FREQUÊNCIA ===
  purchase_frequency: number;           // Compras por mês (ex: 2.5)

  // === SCORES ===
  loyalty_score: number;                // Score de lealdade 0-100 (ex: 85)

  // === STATUS ===
  data_sync_status: {
    ltv_synced: boolean;                // LTV sincronizado?
    dates_synced: boolean;              // Datas sincronizadas?
    preferences_synced: boolean;        // Preferências sincronizadas?
  };
}
```

### Descrição Detalhada

| Métrica | Tipo | Descrição | Exemplo |
|---------|------|-----------|---------|
| `total_purchases` | `number` | Quantidade total de compras realizadas | `15` |
| `total_spent` | `number` | Valor total gasto em todas as compras (LTV) | `1250.50` |
| `lifetime_value_calculated` | `number` | Mesmo que `total_spent` (alias) | `1250.50` |
| `avg_purchase_value` | `number` | Ticket médio (total_spent / total_purchases) | `83.37` |
| `avg_items_per_purchase` | `number` | Média de itens por compra | `3.2` |
| `total_products_bought` | `number` | Soma de todas as quantities vendidas | `48` |
| `last_purchase_real` | `string?` | Data/hora da última compra (ISO 8601) | `"2025-10-15T10:30:00Z"` |
| `days_since_last_purchase` | `number?` | Dias desde a última compra | `4` |
| `purchase_frequency` | `number` | Compras por mês (histórico completo) | `2.5` |
| `loyalty_score` | `number` | Score 0-100 baseado em recência, frequência e valor | `85` |

---

## 💻 Exemplos Práticos

### Exemplo 1: KPI Cards no Header

```typescript
function CustomerHeader({ customerId }: Props) {
  const { data: metrics } = useCustomerMetrics(customerId);

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Valor Total"
        value={formatCurrency(metrics?.total_spent || 0)}
        icon={<DollarSign />}
      />
      <StatCard
        title="Compras"
        value={metrics?.total_purchases || 0}
        icon={<ShoppingBag />}
      />
      <StatCard
        title="Última Compra"
        value={`${metrics?.days_since_last_purchase || 0} dias atrás`}
        icon={<Calendar />}
      />
    </div>
  );
}
```

### Exemplo 2: Badge de Segmentação

```typescript
function CustomerSegmentBadge({ customerId }: Props) {
  const { data: metrics } = useCustomerMetrics(customerId);

  if (!metrics) return null;

  // Lógica de segmentação
  if (metrics.total_purchases === 0) {
    return <Badge color="gray">Sem Compras</Badge>;
  }

  if (metrics.days_since_last_purchase && metrics.days_since_last_purchase > 180) {
    return <Badge color="red">Inativo</Badge>;
  }

  if (metrics.total_spent >= 1000 && metrics.total_purchases >= 10) {
    return <Badge color="gold">VIP</Badge>;
  }

  if (metrics.purchase_frequency >= 3) {
    return <Badge color="blue">Frequente</Badge>;
  }

  return <Badge color="green">Ativo</Badge>;
}
```

### Exemplo 3: Insight de Comportamento

```typescript
function CustomerBehaviorInsight({ customerId }: Props) {
  const { data: metrics } = useCustomerMetrics(customerId);

  if (!metrics || metrics.total_purchases < 2) {
    return <p>Aguardando mais compras para gerar insights...</p>;
  }

  const avgDaysBetweenPurchases = Math.floor(365 / (metrics.purchase_frequency * 12));
  const expectedNextPurchase = (metrics.days_since_last_purchase || 0) - avgDaysBetweenPurchases;

  if (expectedNextPurchase < -7) {
    return (
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <p>Cliente atrasado! Esperada nova compra há {Math.abs(expectedNextPurchase)} dias.</p>
        <Button onClick={() => sendReactivationEmail(customerId)}>
          Enviar Email de Reativação
        </Button>
      </Alert>
    );
  }

  return <p>Cliente com comportamento regular. Próxima compra esperada em ~{expectedNextPurchase} dias.</p>;
}
```

---

## ⚡ Performance e Cache

### Configuração de Cache

```typescript
// Configuração interna do hook:
staleTime: 5 * 60 * 1000,      // 5min - Dados considerados "frescos"
refetchOnWindowFocus: false,   // Não refaz query ao focar janela
refetchOnMount: false,         // Usa cache se disponível
```

### Como o Cache Funciona

**1. Primeira Chamada:**
```typescript
const { data } = useCustomerMetrics('customer-123');
// → Faz query SQL
// → Calcula métricas
// → Armazena em cache com key ['customer-metrics', 'customer-123']
// → Retorna dados
```

**2. Segunda Chamada (mesmo cliente):**
```typescript
const { data } = useCustomerMetrics('customer-123');
// → Verifica cache
// → Encontra dados (< 5min)
// → Retorna INSTANTANEAMENTE (sem query SQL!)
```

**3. Invalidação (após venda histórica):**
```typescript
queryClient.invalidateQueries({ queryKey: ['customer-metrics', 'customer-123'] });
// → Marca cache como "stale"
// → Próxima chamada refaz query SQL
// → Dados atualizados!
```

### Performance Tips

✅ **FAÇA:**
- Use o hook livremente em múltiplos componentes (cache é compartilhado)
- Confie no cache automático do React Query
- Invalide apenas quando necessário (após mutations)

❌ **NÃO FAÇA:**
- Não desabilite o cache (`enabled: false`)
- Não force refetch manual (`refetch()`) sem necessidade
- Não crie queries duplicadas para mesmas métricas

---

## 🎯 Quando Usar vs Não Usar

### ✅ USE quando:

1. **Precisa de métricas básicas do cliente:**
   ```typescript
   const { data: metrics } = useCustomerMetrics(customerId);
   const total = metrics?.total_purchases;
   ```

2. **Quer compartilhar dados entre componentes:**
   ```typescript
   // Header.tsx
   const { data: metrics } = useCustomerMetrics(customerId); // Query 1

   // Overview.tsx
   const { data: metrics } = useCustomerMetrics(customerId); // Cache! (sem query)
   ```

3. **Precisa de cálculos derivados baseados em métricas:**
   ```typescript
   const isVIP = metrics && metrics.total_spent >= 1000;
   ```

### ❌ NÃO USE quando:

1. **Precisa de métricas específicas NÃO incluídas no hook:**
   ```typescript
   // ❌ Não existe: metrics.favorite_category
   // ✅ Use: useCustomerFavorites(customerId) separado
   ```

2. **Precisa de dados que NÃO são métricas:**
   ```typescript
   // ❌ Não existe: metrics.email, metrics.phone
   // ✅ Use: useCustomer(customerId) para dados básicos
   ```

3. **Está em contexto onde customerId não existe:**
   ```typescript
   // ❌ Sem customerId válido
   const { data: metrics } = useCustomerMetrics(undefined);

   // ✅ Guard clause primeiro
   if (!customerId) return null;
   const { data: metrics } = useCustomerMetrics(customerId);
   ```

---

## 🔧 Troubleshooting

### Problema 1: Métricas Não Atualizam

**Sintoma:**
```typescript
// Adiciono venda histórica, mas metrics.total_purchases continua igual
```

**Causa:** Cache não foi invalidado

**Solução:**
```typescript
// Em onSuccess da mutation:
queryClient.invalidateQueries({ queryKey: ['customer-metrics', customerId] });
```

---

### Problema 2: Hook Retorna null

**Sintoma:**
```typescript
const { data: metrics } = useCustomerMetrics(customerId);
console.log(metrics); // null
```

**Possíveis Causas:**

1. **customerId inválido:**
   ```typescript
   // ❌ customerId é undefined
   useCustomerMetrics(undefined);

   // ✅ Validar primeiro
   if (!customerId) return null;
   useCustomerMetrics(customerId);
   ```

2. **Cliente sem compras:**
   ```typescript
   // Hook retorna objeto com zeros, NÃO null
   {
     total_purchases: 0,
     total_spent: 0,
     // ...
   }
   ```

3. **Erro na query:**
   ```typescript
   const { data, error } = useCustomerMetrics(customerId);
   if (error) console.error(error); // Verificar erro
   ```

---

### Problema 3: Performance Ruim

**Sintoma:** Hook demora muito para retornar

**Diagnóstico:**
```typescript
const { data, isLoading, isFetching } = useCustomerMetrics(customerId);
console.log({ isLoading, isFetching });
```

**Possíveis Causas:**

1. **Cliente com muitas vendas (1000+):**
   - Query SQL demora
   - Considerar paginação ou agregação no banco

2. **Cache desabilitado:**
   ```typescript
   // ❌ Não desabilite o cache!
   refetchOnMount: true,
   refetchOnWindowFocus: true,
   ```

3. **Invalidações excessivas:**
   ```typescript
   // ❌ Invalidando muito frequentemente
   setInterval(() => {
     queryClient.invalidateQueries({ queryKey: ['customer-metrics', id] });
   }, 1000); // Muito frequente!
   ```

---

## 📚 Referências

- **Changelog:** `docs/07-changelog/TIMEZONE_FIX_AND_SSOT_METRICS_v3.3.1.md`
- **Guia SSoT:** `docs/02-architecture/guides/SSOT_HOOKS_REFACTORING.md`
- **Código Fonte:** `src/shared/hooks/business/useCustomerMetrics.ts`

---

**Última Atualização:** 19/10/2025
**Versão do Hook:** 1.0.0
**Status:** ✅ Produção (DEV validado)
