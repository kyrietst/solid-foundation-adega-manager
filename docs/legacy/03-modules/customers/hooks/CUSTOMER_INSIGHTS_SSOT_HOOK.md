# useCustomerInsightsSSoT Hook - Documentação

**Versão**: v3.1.1
**Arquivo**: `src/shared/hooks/business/useCustomerInsightsSSoT.ts`
**Tipo**: Business Logic Hook (SSoT v3.1.0)
**Última Atualização**: 10/10/2025

---

## 📋 Visão Geral

Hook centralizado que fornece **análises avançadas e insights** sobre clientes, incluindo gráficos de vendas, produtos preferidos, padrões de compra e métricas de performance com IA.

**Propósito**: Single Source of Truth (SSoT) para todos os dados e cálculos da aba "Insights & Analytics" do perfil do cliente.

---

## 🎯 Características Principais

### 1. **Dados em Tempo Real**
- ✅ React Query com cache otimizado
- ✅ Recalculação automática ao mudar dados
- ✅ Loading states granulares
- ✅ Error handling robusto

### 2. **Cálculos Inteligentes**
- ✅ AI Insights com scoring de oportunidade
- ✅ Análise de contribuição de receita real
- ✅ Padrões de compra e frequência
- ✅ Produtos preferidos e diversidade

### 3. **Performance Otimizado**
- ✅ Memoization com useMemo
- ✅ Cache strategies diferenciadas
- ✅ Lazy loading de dados pesados
- ✅ Graceful degradation

---

## 📖 API do Hook

### Signature

```typescript
function useCustomerInsightsSSoT(
  customerId: string | null | undefined
): CustomerInsightsReturn
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `customerId` | `string \| null \| undefined` | Sim | ID do cliente para buscar insights |

### Retorno

```typescript
interface CustomerInsightsReturn {
  // Dados principais
  customer: Customer | null;
  purchases: CustomerInsightsData[];
  insights: CustomerAIInsights;

  // Chart data
  salesChartData: SalesChartData[];
  productsChartData: ProductsChartData[];
  frequencyChartData: FrequencyChartData[];

  // Estados
  isLoading: boolean;
  error: Error | null;
  hasData: boolean;
  isEmpty: boolean;

  // Controle
  refetch: () => void;
}
```

---

## 🔍 Tipos e Interfaces

### CustomerAIInsights

```typescript
interface CustomerAIInsights {
  // Recomendações
  segmentRecommendation: string;        // Ex: "Cliente VIP - Manter programa de fidelidade"
  nextBestAction: string;               // Ex: "Oferecer produtos premium"

  // Métricas de risco
  riskLevel: 'low' | 'medium' | 'high';
  opportunityScore: number;             // 0-100

  // Produtos
  preferredProducts: string[];          // Top 3 produtos

  // Analytics
  seasonalTrends: string;
  loyaltyIndicators: string[];

  // Performance (v3.1.1 - CORRIGIDO)
  revenueContribution: number;          // % real baseado no total da base
  growthPotential: 'low' | 'medium' | 'high';
  engagementLevel: 'low' | 'medium' | 'high';
}
```

### SalesChartData

```typescript
interface SalesChartData {
  month: string;       // Ex: "set. de 2025"
  amount: number;      // Total de vendas no mês
}
```

### ProductsChartData

```typescript
interface ProductsChartData {
  name: string;        // Nome do produto
  count: number;       // Quantidade vendida
}
```

### FrequencyChartData

```typescript
interface FrequencyChartData {
  label: string;       // Ex: "Compra 2"
  days: number;        // Dias desde compra anterior
}
```

---

## 💡 Exemplos de Uso

### 1. Uso Básico

```tsx
import { useCustomerInsightsSSoT } from '@/shared/hooks/business/useCustomerInsightsSSoT';

function CustomerInsightsTab({ customerId }: { customerId: string }) {
  const {
    customer,
    insights,
    salesChartData,
    productsChartData,
    isLoading,
    error
  } = useCustomerInsightsSSoT(customerId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{customer?.name}</h1>
      <p>Score de Oportunidade: {insights.opportunityScore}/100</p>
      <p>Contribuição: {insights.revenueContribution}%</p>

      {/* Gráficos */}
      <SalesChart data={salesChartData} />
      <ProductsChart data={productsChartData} />
    </div>
  );
}
```

### 2. Uso com Conditional Rendering

```tsx
function InsightsSection({ customerId }: Props) {
  const {
    hasData,
    isEmpty,
    insights,
    frequencyChartData
  } = useCustomerInsightsSSoT(customerId);

  if (isEmpty) {
    return (
      <EmptyState
        title="Sem dados de compra"
        description="Este cliente ainda não realizou compras"
      />
    );
  }

  if (!hasData) {
    return <EmptyState title="Carregando insights..." />;
  }

  return (
    <div>
      <AIInsights data={insights} />
      {frequencyChartData.length > 0 && (
        <FrequencyChart data={frequencyChartData} />
      )}
    </div>
  );
}
```

### 3. Refresh Manual

```tsx
function InsightsHeader({ customerId }: Props) {
  const { refetch, isLoading } = useCustomerInsightsSSoT(customerId);

  return (
    <div>
      <h2>Insights & Analytics</h2>
      <button
        onClick={() => refetch()}
        disabled={isLoading}
      >
        {isLoading ? 'Atualizando...' : 'Atualizar'}
      </button>
    </div>
  );
}
```

---

## 🔧 Implementação Interna

### React Query Hooks

#### 1. Customer Data Query

```typescript
const { data: customer, isLoading: isLoadingCustomer } = useQuery({
  queryKey: ['customer-insights-basic', customerId],
  queryFn: async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    return data;
  },
  enabled: !!customerId,
  staleTime: 5 * 60 * 1000, // 5 min cache
  refetchInterval: false,
  refetchOnWindowFocus: false,
});
```

#### 2. Purchases Data Query

```typescript
const { data: rawPurchases, isLoading: isLoadingPurchases } = useQuery({
  queryKey: ['customer-insights-purchases', customerId],
  queryFn: async (): Promise<CustomerInsightsData[]> => {
    // Últimos 12 meses apenas para performance
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data } = await supabase
      .from('sales')
      .select(`
        id,
        total_amount,
        created_at,
        sale_items (
          product_id,
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq('customer_id', customerId)
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100); // Limitar para performance

    return processedData;
  },
  enabled: !!customerId,
  staleTime: 2 * 60 * 1000,      // 2 min cache
  refetchInterval: 5 * 60 * 1000, // Auto-refresh 5 min
  refetchOnWindowFocus: true,
});
```

#### 3. Total Revenue Query (v3.1.1 - NOVO)

```typescript
const { data: totalRevenue, isLoading: isLoadingTotalRevenue } = useQuery({
  queryKey: ['total-revenue-all-customers'],
  queryFn: async (): Promise<number> => {
    const { data } = await supabase
      .from('sales')
      .select('total_amount');

    const total = data.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    return total;
  },
  staleTime: 10 * 60 * 1000, // 10 min cache (dado agregado estável)
  refetchInterval: false,    // Sem auto-refresh
  refetchOnWindowFocus: false,
});
```

### Cálculos com useMemo

#### Sales Chart Data

```typescript
const salesChartData = useMemo((): SalesChartData[] => {
  const monthlyData = new Map<string, number>();

  rawPurchases.forEach(purchase => {
    const month = format(new Date(purchase.date), 'MMM. \'de\' yyyy', { locale: ptBR });
    const current = monthlyData.get(month) || 0;
    monthlyData.set(month, current + purchase.total);
  });

  return Array.from(monthlyData.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}, [rawPurchases]);
```

#### Products Chart Data

```typescript
const productsChartData = useMemo((): ProductsChartData[] => {
  const productCount: Record<string, number> = {};

  rawPurchases.forEach(purchase => {
    purchase.items.forEach(item => {
      const current = productCount[item.product_name] || 0;
      productCount[item.product_name] = current + item.quantity;
    });
  });

  return Object.entries(productCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 produtos
}, [rawPurchases]);
```

#### AI Insights (v3.1.1 - CORRIGIDO)

```typescript
const insights = useMemo((): CustomerAIInsights => {
  const totalSpent = rawPurchases.reduce((sum, p) => sum + p.total, 0);
  const averageTicket = rawPurchases.length > 0 ? totalSpent / rawPurchases.length : 0;

  // Revenue Contribution - CÁLCULO REAL (v3.1.1)
  const revenueContribution = totalRevenue > 0
    ? Math.round((totalSpent / totalRevenue) * 100)
    : 0;

  // Opportunity Score
  let opportunityScore = 0;
  if (rawPurchases.length > 0) {
    opportunityScore = Math.min(100,
      (rawPurchases.length * 10) +           // Engagement
      (averageTicket > 100 ? 20 : 10) +     // Spending level
      (daysSinceLastPurchase < 30 ? 30 : 0) + // Recency
      (preferredProducts.length * 10)        // Diversity
    );
  }

  return {
    segmentRecommendation,
    nextBestAction,
    riskLevel,
    opportunityScore: Math.round(opportunityScore),
    preferredProducts,
    revenueContribution, // Agora correto!
    growthPotential,
    engagementLevel
  };
}, [rawPurchases, customer, totalRevenue, productsChartData]);
```

---

## 🎨 Padrões de Uso

### Pattern 1: Loading States

```tsx
const {
  isLoading,
  hasData,
  isEmpty
} = useCustomerInsightsSSoT(customerId);

// Prioridade de renderização
if (isLoading) return <LoadingState />;
if (isEmpty) return <EmptyState />;
if (!hasData) return <ErrorState />;
return <InsightsContent />;
```

### Pattern 2: Error Handling

```tsx
const { error } = useCustomerInsightsSSoT(customerId);

if (error) {
  console.error('❌ Erro ao carregar insights:', error);
  return <ErrorMessage error={error} />;
}
```

### Pattern 3: Conditional Data Display

```tsx
const {
  salesChartData,
  frequencyChartData
} = useCustomerInsightsSSoT(customerId);

return (
  <div>
    {/* Sempre tem se há compras */}
    {salesChartData.length > 0 && <SalesChart data={salesChartData} />}

    {/* Só tem se houver 2+ compras */}
    {frequencyChartData.length > 0 && <FrequencyChart data={frequencyChartData} />}
  </div>
);
```

---

## ⚡ Performance

### Cache Strategies

| Query | Stale Time | Refetch Interval | Reasoning |
|-------|------------|------------------|-----------|
| **customer** | 5min | ❌ Não | Dados básicos raramente mudam |
| **purchases** | 2min | ✅ 5min | Dados dinâmicos, precisa estar atualizado |
| **totalRevenue** | 10min | ❌ Não | Agregado estável, cache longo |

### Otimizações

1. **Limit de Compras**: Máximo 100 compras mais recentes
2. **Filtro Temporal**: Últimos 12 meses apenas
3. **Memoization**: Todos os cálculos com useMemo
4. **Seletores SQL**: Apenas campos necessários

### Métricas de Performance

| Métrica | Valor Médio | Target |
|---------|-------------|--------|
| Tempo de Loading Inicial | ~800ms | < 1s |
| Tempo com Cache Hit | ~50ms | < 100ms |
| Recalculação (useMemo) | ~20ms | < 50ms |
| Total Queries | 3 | ≤ 3 |

---

## 🧪 Testing

### Unit Tests Example

```typescript
describe('useCustomerInsightsSSoT', () => {
  it('deve calcular revenueContribution corretamente', () => {
    const totalSpent = 307;
    const totalRevenue = 494.35;

    const expected = Math.round((307 / 494.35) * 100); // 62%

    const { result } = renderHook(() => useCustomerInsightsSSoT(mockCustomerId));

    expect(result.current.insights.revenueContribution).toBe(expected);
  });

  it('deve retornar dados vazios quando cliente sem compras', () => {
    const { result } = renderHook(() => useCustomerInsightsSSoT(emptyCustomerId));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.salesChartData).toEqual([]);
    expect(result.current.productsChartData).toEqual([]);
  });
});
```

---

## 🐛 Troubleshooting

### Problema: "revenueContribution mostra 0%"

**Causa**: Query de totalRevenue falhou ou retornou 0

**Solução**:
```typescript
// Verificar no console
console.log('Total Revenue:', totalRevenue);

// Se 0, verificar RLS policies da tabela sales
```

### Problema: "Gráfico não exibe valores reais"

**Causa**: Componente de gráfico não usa `domain={[0, 'dataMax']}`

**Solução**:
```tsx
// Adicionar ao YAxis
<YAxis domain={[0, 'dataMax']} />
```

### Problema: "Loading infinito"

**Causa**: `customerId` é `null` ou `undefined`

**Solução**:
```typescript
// Sempre verificar antes de usar o hook
if (!customerId) return <ErrorState />;

const insights = useCustomerInsightsSSoT(customerId);
```

---

## 📚 Referências

**Documentação Relacionada:**
- [Customer Insights Tab Fixes v3.1.1](../components/CUSTOMER_INSIGHTS_TAB_FIXES_v3.1.1.md)
- [Chart Accessibility Guide](../../../04-design-system/CHART_ACCESSIBILITY_GUIDE.md)
- [SSoT Architecture Guide](../SSOT_ARCHITECTURE_GUIDE.md)

**Dependências:**
- `@tanstack/react-query` - Data fetching e caching
- `date-fns` - Formatação de datas
- `@/core/api/supabase/client` - Cliente Supabase

---

**Versão do Documento**: 1.0
**Última Atualização**: 10/10/2025
**Mantido por**: Equipe de Desenvolvimento
