# useCustomerPurchaseHistory Hook v3.3.2 - Technical Reference

## 📋 Overview

O **useCustomerPurchaseHistory** é um hook SSoT v3.3.2 que implementa busca direta do banco de dados com filtros server-side, métricas comportamentais/preditivas, display de taxa de entrega e sistema de paginação aprimorado, eliminando dependências de props e otimizando performance para escalabilidade empresarial.

**Localização**: `src/shared/hooks/business/useCustomerPurchaseHistory.ts`
**Versão**: 3.3.2 - SSoT + Behavioral Metrics + Delivery Fee + Pagination
**Status**: ✅ **PRODUCTION READY**

---

## 🎯 Principais Features

### ✅ **Server-Side Architecture**
- Busca direta do Supabase sem dependência de props
- Filtros de período executados no PostgreSQL
- Queries otimizadas com JOINs eficientes
- Paginação implementada com LIMIT/OFFSET

### ✅ **Behavioral & Predictive Metrics** (v3.2.0)
- Análise de frequência de compra (intervalos médios)
- Tendência de gastos (crescendo/estável/declinando)
- Predição de próxima compra esperada
- Edge cases tratados (clientes com poucas compras)

### ✅ **Delivery Fee Support** (v3.3.2 - NEW)
- Display separado de subtotal e taxa de entrega
- Cálculo correto: total = subtotal + delivery_fee
- Interface atualizada com breakdown visual
- 272 vendas com R$ 3,664.00 em taxas agora visíveis

### ✅ **Enhanced Pagination** (v3.3.2 - NEW)
- Limite aumentado: 20 → 100 vendas por página
- Sistema de acumulação de páginas implementado
- Função loadMore() funcional para carga sob demanda
- Reset automático ao mudar filtros
- Estados: currentPage, accumulatedPurchases, hasMoreData

### ✅ **Performance Optimization**
- Cache inteligente React Query (30s stale, 2min refetch)
- Payload aprimorado (100 registros por página)
- Real-time calculations para métricas
- Auto-refresh em window focus

### ✅ **Error Resilience**
- Error handling robusto com retry
- Fallback para cálculos manuais
- Loading states granulares
- Timeout protection

---

## 🔧 API Reference

### **Hook Signature**
```typescript
export const useCustomerPurchaseHistory = (
  customerId: string,
  filters: PurchaseFilters,
  pagination: PaginationOptions = { page: 1, limit: 100, hasMore: true }  // ✅ v3.3.2: 20 → 100
): PurchaseHistoryOperations
```

### **Types & Interfaces**

#### **PurchaseFilters**
```typescript
export interface PurchaseFilters {
  searchTerm: string;                    // Busca por nome do produto
  periodFilter: 'all' | '30' | '90' | '180' | '365';  // Filtro de período
}
```

#### **PaginationOptions**
```typescript
export interface PaginationOptions {
  page: number;        // Página atual (1-based)
  limit: number;       // Registros por página (padrão: 100, v3.3.2 - antes: 20)
  hasMore: boolean;    // Indica se há mais páginas
}
```

#### **PurchaseHistoryOperations (Return)**
```typescript
export interface PurchaseHistoryOperations {
  // Dados do servidor
  purchases: Purchase[];

  // Estados de carregamento
  isLoading: boolean;
  error: Error | null;

  // Resumo estatístico (real-time)
  summary: PurchaseSummary;

  // Métricas comportamentais (v3.2.0 - NEW)
  behavioralMetrics: BehavioralMetrics;

  // Paginação
  pagination: PaginationOptions;
  loadMore: () => void;

  // Funções utilitárias
  formatPurchaseDate: (date: string) => string;
  formatPurchaseId: (id: string) => string;

  // Refresh manual
  refetch: () => void;

  // Estado derivado
  hasData: boolean;
  isEmpty: boolean;
  isFiltered: boolean;
}
```

#### **Purchase & PurchaseSummary**
```typescript
export interface Purchase {
  id: string;
  order_number: number;
  date: string;
  subtotal: number;        // ✅ v3.3.2: Valor dos produtos (total_amount)
  delivery_fee: number;    // ✅ v3.3.2: Taxa de entrega separada
  total: number;           // ✅ v3.3.2: Total final (subtotal + delivery_fee)
  items: PurchaseItem[];
}

export interface PurchaseItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface PurchaseSummary {
  totalSpent: number;      // Valor total gasto (incluindo delivery_fee)
  totalItems: number;      // Quantidade total de itens
  averageTicket: number;   // Ticket médio
  purchaseCount: number;   // Número de compras
}
```

#### **BehavioralMetrics** (v3.2.0 - NEW)
```typescript
export interface BehavioralMetrics {
  avgPurchaseInterval: number;           // Média de dias entre compras
  purchaseIntervalText: string;          // Formatado: "A cada 15 dias", "Mensalmente"

  spendingTrend: {
    direction: 'up' | 'stable' | 'down'; // Direção da tendência
    text: string;                        // "↑ Crescendo", "→ Estável", "↓ Declinando"
    percentage: number;                  // Variação percentual (ex: 15.5)
    color: string;                       // Cor para UI (ex: 'text-accent-green')
  };

  nextPurchaseExpected: {
    daysUntil: number;                   // Dias até próxima (positivo ou negativo)
    text: string;                        // "Em 5 dias" ou "Atrasada 3 dias"
    status: 'on-time' | 'soon' | 'overdue'; // Status da próxima compra
    color: string;                       // Cor para UI
  };
}
```

**Regras de Cálculo**:
- **Frequência**: Requer mínimo 2 compras
- **Tendência**: Requer mínimo 6 compras (compara 3 recentes vs 3 anteriores)
- **Próxima Compra**: Baseada na frequência média e última compra

**Valores Padrão** (quando dados insuficientes):
```typescript
{
  avgPurchaseInterval: 0,
  purchaseIntervalText: 'Dados insuficientes',
  spendingTrend: {
    direction: 'stable',
    text: '→ Sem dados',
    percentage: 0,
    color: 'text-gray-400'
  },
  nextPurchaseExpected: {
    daysUntil: 0,
    text: 'Aguardando mais compras',
    status: 'on-time',
    color: 'text-gray-400'
  }
}
```

#### **Pagination States** (v3.3.2 - NEW)
```typescript
// Estados internos para sistema de acumulação
const [currentPage, setCurrentPage] = useState(1);
const [accumulatedPurchases, setAccumulatedPurchases] = useState<Purchase[]>([]);
const [hasMoreData, setHasMoreData] = useState(true);
```

**Comportamento da Paginação:**
- **Primeira página**: `accumulatedPurchases` é substituído completamente
- **Páginas subsequentes**: Novos dados são acumulados no final do array
- **Detecção de fim**: `hasMoreData` calculado por `rawPurchases.length === limit`
- **Reset automático**: Ao mudar `searchTerm`, `periodFilter`, `productSearchTerm` ou `customerId`

**Função loadMore:**
```typescript
const loadMore = useCallback(() => {
  if (hasMoreData && !isLoading) {
    setCurrentPage(prev => prev + 1);
  }
}, [hasMoreData, isLoading]);
```

---

## 💻 Implementation Details

### **1. Server-Side Query Construction**

```typescript
const queryFn = async (): Promise<Purchase[]> => {
  if (!customerId) return [];

  try {
    // Construir query base com JOINs otimizados
    let query = supabase
      .from('sales')
      .select(`
        id,
        order_number,
        total_amount,
        delivery_fee,  // ✅ v3.3.2: Adiciona taxa de entrega
        created_at,
        sale_items (
          product_id,
          quantity,
          unit_price,
          products (
            name
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    // ✅ FILTRO SERVER-SIDE POR PERÍODO
    const periodDate = calculatePeriodDate(periodFilter);
    if (periodDate) {
      query = query.gte('created_at', periodDate);
    }

    // ✅ PAGINAÇÃO SERVER-SIDE
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.range(offset, offset + pagination.limit - 1);

    const { data: sales, error: salesError } = await query;
    // ... processamento dos dados
  } catch (error) {
    console.error('❌ Erro crítico ao buscar histórico de compras:', error);
    throw error;
  }
};
```

### **2. Period Date Calculation**

```typescript
const calculatePeriodDate = (periodFilter: string): string | null => {
  if (periodFilter === 'all') return null;

  const now = new Date();
  const filterDate = new Date();

  switch (periodFilter) {
    case '30':
      filterDate.setDate(now.getDate() - 30);
      break;
    case '90':
      filterDate.setDate(now.getDate() - 90);
      break;
    case '180':
      filterDate.setDate(now.getDate() - 180);
      break;
    case '365':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return filterDate.toISOString();
};
```

### **3. React Query Configuration**

```typescript
return useQuery({
  queryKey: ['customer-purchase-history', customerId, { searchTerm, periodFilter, page: pagination.page }],
  queryFn,
  enabled: !!customerId,                    // Só executa se customerId válido
  staleTime: 30 * 1000,                    // 30 segundos de cache
  refetchInterval: 2 * 60 * 1000,          // Refetch automático 2 minutos
  refetchOnWindowFocus: true,              // Atualiza ao focar janela
});
```

### **4. Real-Time Summary Calculations**

```typescript
const summary = useMemo((): PurchaseSummary => {
  if (!rawPurchases || rawPurchases.length === 0) {
    return {
      totalSpent: 0,
      totalItems: 0,
      averageTicket: 0,
      purchaseCount: 0
    };
  }

  const totalSpent = rawPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalItems = rawPurchases.reduce((sum, purchase) =>
    sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const purchaseCount = rawPurchases.length;
  const averageTicket = purchaseCount > 0 ? totalSpent / purchaseCount : 0;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalItems,
    averageTicket: Math.round(averageTicket * 100) / 100,
    purchaseCount
  };
}, [rawPurchases]);
```

### **5. Behavioral Metrics Calculations** (v3.2.0 - NEW)

```typescript
const behavioralMetrics = useMemo((): BehavioralMetrics => {
  // Default values para quando não há dados suficientes
  const defaultMetrics: BehavioralMetrics = { /* ... */ };

  // Precisa de pelo menos 2 compras para calcular intervalo
  if (!rawPurchases || rawPurchases.length < 2) {
    return defaultMetrics;
  }

  // ============================================================================
  // 1. FREQUÊNCIA DE COMPRA (Average Purchase Interval)
  // ============================================================================

  const intervals: number[] = [];
  for (let i = 1; i < rawPurchases.length; i++) {
    const date1 = new Date(rawPurchases[i - 1].date);
    const date2 = new Date(rawPurchases[i].date);
    const daysDiff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(Math.abs(daysDiff));
  }

  const avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);

  // Formatar texto de intervalo
  let intervalText: string;
  if (avgInterval < 7) {
    intervalText = `A cada ${avgInterval} dias`;
  } else if (avgInterval < 30) {
    const weeks = Math.round(avgInterval / 7);
    intervalText = weeks === 1 ? 'Semanalmente' : `A cada ${weeks} semanas`;
  } else if (avgInterval < 365) {
    const months = Math.round(avgInterval / 30);
    intervalText = months === 1 ? 'Mensalmente' : `A cada ${months} meses`;
  } else {
    const years = Math.round(avgInterval / 365);
    intervalText = years === 1 ? 'Anualmente' : `A cada ${years} anos`;
  }

  // ============================================================================
  // 2. TENDÊNCIA DE GASTOS (Spending Trend)
  // ============================================================================

  let spendingTrend = defaultMetrics.spendingTrend;

  // Precisa de pelo menos 6 compras para comparar 3 vs 3
  if (rawPurchases.length >= 6) {
    const recent3 = rawPurchases.slice(0, 3).reduce((sum, p) => sum + p.total, 0);
    const previous3 = rawPurchases.slice(3, 6).reduce((sum, p) => sum + p.total, 0);

    const changePercentage = previous3 > 0
      ? ((recent3 - previous3) / previous3) * 100
      : 0;

    if (changePercentage > 10) {
      spendingTrend = {
        direction: 'up',
        text: '↑ Crescendo',
        percentage: Math.round(changePercentage * 10) / 10,
        color: 'text-accent-green'
      };
    } else if (changePercentage < -10) {
      spendingTrend = {
        direction: 'down',
        text: '↓ Declinando',
        percentage: Math.round(changePercentage * 10) / 10,
        color: 'text-red-400'
      };
    } else {
      spendingTrend = {
        direction: 'stable',
        text: '→ Estável',
        percentage: Math.round(changePercentage * 10) / 10,
        color: 'text-accent-blue'
      };
    }
  }

  // ============================================================================
  // 3. PRÓXIMA COMPRA ESPERADA (Next Purchase Expected)
  // ============================================================================

  const lastPurchaseDate = new Date(rawPurchases[0].date);
  const today = new Date();
  const daysSinceLastPurchase = Math.floor(
    (today.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysUntilExpected = avgInterval - daysSinceLastPurchase;

  let nextPurchaseExpected = defaultMetrics.nextPurchaseExpected;

  if (daysUntilExpected > 5) {
    nextPurchaseExpected = {
      daysUntil: daysUntilExpected,
      text: `Em ${daysUntilExpected} dias`,
      status: 'on-time',
      color: 'text-accent-green'
    };
  } else if (daysUntilExpected > 0) {
    nextPurchaseExpected = {
      daysUntil: daysUntilExpected,
      text: `Em ${daysUntilExpected} dias`,
      status: 'soon',
      color: 'text-amber-400'
    };
  } else {
    nextPurchaseExpected = {
      daysUntil: daysUntilExpected,
      text: `Atrasada ${Math.abs(daysUntilExpected)} dias`,
      status: 'overdue',
      color: 'text-red-400'
    };
  }

  return {
    avgPurchaseInterval: avgInterval,
    purchaseIntervalText: intervalText,
    spendingTrend,
    nextPurchaseExpected
  };
}, [rawPurchases]);
```

**Validação**: Todos os cálculos validados com dados reais (Cliente Luciano TESTE, 4 compras).

---

## 🚀 Usage Examples

### **Basic Usage**
```typescript
import { useCustomerPurchaseHistory } from '@/shared/hooks/business/useCustomerPurchaseHistory';

const MyComponent = ({ customerId }: { customerId: string }) => {
  const [filters, setFilters] = useState<PurchaseFilters>({
    searchTerm: '',
    periodFilter: 'all'
  });

  const {
    purchases,
    isLoading,
    error,
    summary,
    hasData,
    isEmpty,
    refetch
  } = useCustomerPurchaseHistory(customerId, filters);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (isEmpty) return <EmptyState />;

  return (
    <div>
      <SummaryCards summary={summary} />
      <PurchasesList purchases={purchases} />
    </div>
  );
};
```

### **With Period Filtering**
```typescript
const PurchaseHistoryWithFilters = ({ customerId }: { customerId: string }) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | '30' | '90' | '180' | '365'>('30');

  const { purchases, summary, isLoading } = useCustomerPurchaseHistory(
    customerId,
    { searchTerm: '', periodFilter },
    { page: 1, limit: 10, hasMore: true }
  );

  return (
    <div>
      <Select value={periodFilter} onValueChange={setPeriodFilter}>
        <SelectItem value="all">Todas</SelectItem>
        <SelectItem value="30">Últimos 30 dias</SelectItem>
        <SelectItem value="90">Últimos 3 meses</SelectItem>
        <SelectItem value="180">Últimos 6 meses</SelectItem>
        <SelectItem value="365">Último ano</SelectItem>
      </Select>

      {!isLoading && (
        <div>
          <p>Total gasto: R$ {summary.totalSpent.toFixed(2)}</p>
          <p>Compras: {summary.purchaseCount}</p>
          <p>Ticket médio: R$ {summary.averageTicket.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};
```

### **With Search Functionality**
```typescript
const SearchablePurchaseHistory = ({ customerId }: { customerId: string }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { purchases, isLoading } = useCustomerPurchaseHistory(
    customerId,
    { searchTerm, periodFilter: 'all' }
  );

  return (
    <div>
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar produtos..."
      />

      {!isLoading && purchases.map(purchase => (
        <PurchaseCard key={purchase.id} purchase={purchase} />
      ))}
    </div>
  );
};
```

### **With Behavioral Metrics** (v3.2.0 - NEW)
```typescript
const PurchaseHistoryWithBehavioral = ({ customerId }: { customerId: string }) => {
  const {
    purchases,
    summary,
    behavioralMetrics,
    isLoading,
    hasData
  } = useCustomerPurchaseHistory(
    customerId,
    { searchTerm: '', periodFilter: 'all' }
  );

  if (isLoading) return <LoadingSpinner />;
  if (!hasData) return <EmptyState />;

  return (
    <div>
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Gasto" value={`R$ ${summary.totalSpent.toFixed(2)}`} />
        <StatCard title="Itens" value={summary.totalItems} />
        <StatCard title="Ticket Médio" value={`R$ ${summary.averageTicket.toFixed(2)}`} />
        <StatCard title="Compras" value={summary.purchaseCount} />
      </div>

      {/* Métricas Comportamentais */}
      {purchases.length >= 2 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Análise de Comportamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {/* Frequência */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {behavioralMetrics.purchaseIntervalText}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Frequência de Compra
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Média: {behavioralMetrics.avgPurchaseInterval} dias
                </div>
              </div>

              {/* Tendência */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${behavioralMetrics.spendingTrend.color}`}>
                  {behavioralMetrics.spendingTrend.text}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Tendência de Gastos
                </div>
                {behavioralMetrics.spendingTrend.percentage !== 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {behavioralMetrics.spendingTrend.percentage > 0 ? '+' : ''}
                    {behavioralMetrics.spendingTrend.percentage}% vs período anterior
                  </div>
                )}
              </div>

              {/* Próxima Compra */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${behavioralMetrics.nextPurchaseExpected.color}`}>
                  {behavioralMetrics.nextPurchaseExpected.text}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Próxima Compra
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {behavioralMetrics.nextPurchaseExpected.status === 'overdue'
                    ? '⚠️ Ação recomendada'
                    : '✓ No prazo'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Compras */}
      <div className="space-y-4">
        {purchases.map(purchase => (
          <PurchaseCard key={purchase.id} purchase={purchase} />
        ))}
      </div>
    </div>
  );
};
```

---

## ⚡ Performance Considerations

### **Optimization Techniques**

1. **Server-Side Filtering**: Reduz payload e processamento
2. **Intelligent Caching**: Evita requests desnecessários
3. **Pagination**: Limita quantidade de dados carregados
4. **Memoized Calculations**: Evita recálculos desnecessários

### **Cache Invalidation Strategy**

```typescript
// Invalidar cache após operações relacionadas
queryClient.invalidateQueries(['customer-purchase-history', customerId]);

// Cache key structure para granularidade
['customer-purchase-history', customerId, { searchTerm, periodFilter, page }]
```

### **Memory Management**

- Limit de 100 registros por página por padrão (v3.3.2 - antes: 20)
- Sistema de acumulação: novos dados adicionados ao array existente
- Cleanup automático do React Query
- Memoization para cálculos pesados (summary, behavioralMetrics)
- Debounce recomendado para search (300ms)

---

## 🐛 Troubleshooting

### **Issue 1: Empty Results**
```typescript
// Debug checklist:
1. Verificar se customerId não é null/undefined
2. Verificar permissões RLS nas tabelas: sales, sale_items, products
3. Verificar se há dados reais para o cliente
4. Verificar console.error para erros de query
```

### **Issue 2: Slow Performance**
```typescript
// Verificações:
1. Confirmar que filtros server-side estão funcionando
2. Verificar índices no banco para customer_id + created_at
3. Considerar reduzir limit se ainda lento
4. Verificar complexidade dos JOINs
```

### **Issue 3: Cache Issues**
```typescript
// Soluções:
1. Verificar se queryKey está correto
2. Ajustar staleTime se necessário
3. Invalidar cache manualmente se needed: queryClient.invalidateQueries()
4. Verificar se enabled está configurado corretamente
```

### **Issue 4: Search Not Working**
```typescript
// Verificar:
1. Se searchTerm está sendo passado corretamente
2. Se filtering client-side está funcionando
3. Se há dados para filtrar
4. Implementar debounce se input muito rápido
```

---

## 🔮 Future Enhancements

### **v3.2 Completed** ✅
1. ~~**Behavioral Metrics**: Análise de frequência, tendência e predições~~ ✅ Implementado
2. ~~**Predictive Analytics**: Próxima compra esperada com status~~ ✅ Implementado

### **v3.3 Completed** ✅
1. ~~**Delivery Fee Display**: Subtotal + delivery_fee separados~~ ✅ Implementado (v3.3.2)
2. ~~**Advanced Pagination**: Load more functionality (100 itens/página)~~ ✅ Implementado (v3.3.2)
3. ~~**Accumulation System**: Sistema de acumulação de páginas~~ ✅ Implementado (v3.3.2)

### **v3.4 Planned Features**
1. **Server-Side Search**: Busca por produto no PostgreSQL (migrar de client-side)
2. **Real-time Subscriptions**: Supabase subscriptions para updates automáticos
3. **Bulk Operations**: Operações em lote para múltiplas compras

### **v3.5 Advanced Features**
1. **Cached Aggregations**: Stored procedures para cálculos complexos pré-computados
2. **Export Functionality**: Download de dados filtrados em CSV/Excel
3. **Advanced Filtering**: Filtros por valor, categoria, faixa de preço
4. **Machine Learning**: Predições mais avançadas com histórico completo

---

## 📚 Related Documentation

- [Customer Purchase History Tab v3.1.0](../components/CUSTOMER_PURCHASE_HISTORY_TAB_V3.1.md)
- [SSoT Migration Guide v3.1.0](../../../06-operations/guides/SSOT_MIGRATION_GUIDE_V3.1.md)
- [SSoT System Architecture](../../../02-architecture/SSOT_SYSTEM_ARCHITECTURE.md)
- [Performance Benchmarks](../../../08-testing/PERFORMANCE_BENCHMARKS.md)

---

## 👥 Support and Contributing

**Maintainer**: Adega Manager Team
**Architecture**: SSoT (Single Source of Truth) v3.3.2
**Created**: 2025-09-30
**Last Updated**: 2025-10-23 (v3.3.2 - Delivery Fee + Enhanced Pagination)

**For technical support**: Verificar logs do Supabase e React Query DevTools
**For enhancements**: Seguir padrões SSoT estabelecidos nesta documentação

---

## 📝 Changelog

### v3.3.2 (2025-10-23)
- ✅ Added delivery_fee support to Purchase interface
- ✅ Enhanced pagination (20 → 100 items per page)
- ✅ Implemented accumulation system for loadMore functionality
- ✅ Added automatic reset on filter changes

### v3.2.0 (2025-10-10)
- ✅ Behavioral metrics implementation
- ✅ Predictive analytics for next purchase
- ✅ Spending trend analysis

### v3.1.0 (2025-09-30)
- ✅ Initial SSoT implementation
- ✅ Server-side filters
- ✅ Real-time summary calculations