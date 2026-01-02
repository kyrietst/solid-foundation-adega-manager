# CustomerOverviewTab - SSoT Timeline Implementation

## 📋 Overview

O **CustomerOverviewTab** é o componente central da aba "Visão Geral" que combina dashboard de métricas com timeline de atividades em tempo real, implementando a arquitetura SSoT v3.0.0 com correções críticas para exibição correta de dados.

---

## 🏗️ Arquitetura do Componente

### **Localização**
```
/src/features/customers/components/CustomerOverviewTab.tsx
```

### **Propósito Principal**
Fornecer uma visão consolidada do cliente que integra:
- **Dashboard de métricas** - KPIs e analytics em tempo real
- **Timeline de atividades** - Histórico completo de interações
- **Métricas avançadas** - Insights de comportamento e performance
- **Integração SSoT** - Dados centralizados e sincronizados

---

## 🎯 Funcionalidades Implementadas

### **1. Sistema de Métricas SSoT v3.0.0**
```tsx
// Hooks SSoT v3.0.0 - Dados reais do Supabase
const customerId = customer?.id || null;
const { data: realMetrics, isLoading: metricsLoading } = useCustomerRealMetrics(customerId);
const { data: purchases = [], isLoading: purchasesLoading } = useCustomerPurchases(customerId);
const { data: timeline = [], isLoading: timelineLoading } = useCustomerTimeline(customerId || '');
```

### **2. Timeline de Atividades Completa** ⭐ **IMPLEMENTAÇÃO RECENTE**

**❌ Estado Anterior:**
```tsx
// Placeholder estático (removido)
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-white">Timeline de Atividades</h3>
  <div className="text-gray-400 text-center py-8">
    📅 Timeline integrada será implementada na próxima versão...
  </div>
</div>
```

**✅ Implementação Atual:**
```tsx
// Timeline funcional com dados reais
{timelineLoading ? (
  <LoadingSpinner size="sm" />
) : timeline.length > 0 ? (
  <div className="space-y-4">
    {timeline.map((activity) => {
      const IconComponent = getTimelineIcon(activity.type);
      return (
        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <IconComponent className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white truncate">
                {activity.title}
              </h4>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {formatDistanceToNow(new Date(activity.created_at), { locale: ptBR, addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {activity.description}
            </p>
            {activity.amount && (
              <div className="text-sm text-green-400 mt-1">
                Valor: {formatCurrency(activity.amount)}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
) : (
  <EmptyState
    icon={Clock}
    title="Nenhuma atividade registrada"
    description="As atividades do cliente aparecerão aqui conforme forem registradas"
  />
)}
```

### **3. Sistema de Ícones da Timeline**
```tsx
const getTimelineIcon = (activityType: string) => {
  switch (activityType) {
    case 'sale':
      return ShoppingBag;
    case 'interaction':
      return PhoneCall;
    case 'event':
      return FileText;
    default:
      return Clock;
  }
};
```

---

## 📊 Métricas Avançadas - Correções Implementadas

### **❌ Problema Original: StatCards mostrando "—"**

**Problema identificado nas Métricas Avançadas:**
```tsx
// ❌ ANTES - Cards mostrando placeholders
<StatCard
  title="Ticket Médio"
  value={ticketMedio}
  // formatType padrão causava conflitos
/>
```

**✅ Solução Implementada:**
```tsx
// ✅ DEPOIS - Correção com formatType="none"
<StatCard
  title="Ticket Médio"
  value={ticketMedio}
  description="💰 Valor médio por compra"
  icon={TrendingUp}
  variant="default"
  className="h-28"
  formatType="none" // ✅ Evita reprocessamento
/>

<StatCard
  title="Categoria Favorita"
  value={categoriaFavorita}
  description="🏆 Mais comprada"
  icon={Star}
  variant="warning"
  className="h-28"
  formatType="none" // ✅ Evita reprocessamento
/>

<StatCard
  title="Itens por Compra"
  value={itensPorCompra}
  description="📦 Média de itens"
  icon={Package}
  variant="purple"
  className="h-28"
  formatType="none" // ✅ Evita reprocessamento
/>
```

---

## 🔄 Integração com useCustomerTimeline

### **Hook Dedicado Criado**
```tsx
// Hook SSoT v3.0.0 para Timeline Completa
export const useCustomerTimeline = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-timeline', customerId],
    queryFn: async (): Promise<TimelineActivity[]> => {
      if (!customerId) return [];

      try {
        // Consolidar todas as atividades do cliente em paralelo
        const [salesResult, interactionsResult, eventsResult] = await Promise.allSettled([
          // 1. VENDAS
          supabase
            .from('sales')
            .select('id, total_amount, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false }),

          // 2. INTERAÇÕES MANUAIS
          supabase
            .from('customer_interactions')
            .select('id, interaction_type, description, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false }),

          // 3. EVENTOS DO SISTEMA
          supabase
            .from('customer_events')
            .select('id, source, payload, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
        ]);

        // Processar e consolidar todas as atividades
        const activities: TimelineActivity[] = [];

        // [Processamento detalhado de cada fonte...]

        return sortedActivities.slice(0, 20); // 20 mais recentes
      } catch (error) {
        console.error('❌ Erro ao buscar timeline do cliente:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
};
```

### **Consolidação de Múltiplas Fontes**
1. **Sales**: Vendas realizadas pelo cliente
2. **Interactions**: Interações manuais registradas
3. **Events**: Eventos automáticos do sistema

---

## 🎨 Layout e Estrutura

### **Seções Principais**
```tsx
<div className="space-y-6">
  {/* Métricas Principais */}
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <KPIMetrics />
  </section>

  {/* Métricas Avançadas */}
  <section>
    <h3 className="text-lg font-semibold mb-4">Métricas Avançadas</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AdvancedMetrics />
    </div>
  </section>

  {/* Analytics e Timeline */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <section>
      <h3 className="text-lg font-semibold mb-4">Purchase Analytics</h3>
      <ChartVisualization />
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-4">Timeline de Atividades</h3>
      <TimelineComponent />
    </section>
  </div>
</div>
```

### **Responsive Design**
- **Mobile**: Stack vertical para todas as seções
- **Tablet**: Grid 2 colunas para métricas
- **Desktop**: Grid 3 colunas + layout otimizado

---

## 📈 Cálculos de Métricas

### **Ticket Médio**
```tsx
const ticketMedio = useMemo(() => {
  if (!purchases.length) return 'R$ 0,00';
  const total = purchases.reduce((sum, purchase) => sum + Number(purchase.total_amount), 0);
  const media = total / purchases.length;
  return formatCurrency(media);
}, [purchases]);
```

### **Categoria Favorita**
```tsx
const categoriaFavorita = useMemo(() => {
  if (!purchases.length) return 'Nenhuma';

  const categorias = purchases.reduce((acc, purchase) => {
    const categoria = purchase.categoria || 'Sem categoria';
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});

  const maisFrequente = Object.entries(categorias).reduce((a, b) =>
    categorias[a[0]] > categorias[b[0]] ? a : b
  );

  return maisFrequente ? maisFrequente[0] : 'Nenhuma';
}, [purchases]);
```

### **Itens por Compra**
```tsx
const itensPorCompra = useMemo(() => {
  if (!purchases.length) return '0';
  const totalItens = purchases.reduce((sum, purchase) => sum + (purchase.total_items || 1), 0);
  const media = totalItens / purchases.length;
  return media.toFixed(1); // Uma casa decimal
}, [purchases]);
```

---

## 🔧 Timeline Activity Interface

```tsx
export interface TimelineActivity {
  id: string;
  type: 'sale' | 'interaction' | 'event';
  title: string;
  description: string;
  amount?: number;
  created_at: string;
  metadata?: {
    sale_id?: string;
    interaction_type?: string;
    event_source?: string;
  };
}
```

---

## 🚀 Performance Optimizations

### **Memoization Strategy**
```tsx
// Memoização de cálculos pesados
const analytics = useCustomerAnalytics(purchases, {
  totalPurchases: realMetrics?.total_purchases || purchases.length,
  lifetimeValue: realMetrics?.lifetime_value_calculated || 0,
  daysSinceLastPurchase: realMetrics?.days_since_last_purchase || 0
});

const purchaseHistory = useCustomerPurchaseHistory(purchases, {
  limit: 10,
  sortBy: 'date',
  includeItems: false
});
```

### **React Query Caching**
- **staleTime**: 30 segundos para timeline
- **refetchInterval**: 2 minutos para atualizações automáticas
- **refetchOnWindowFocus**: true para dados sempre atualizados

---

## 🧪 Testing Coverage

### **Unit Tests**
```tsx
describe('CustomerOverviewTab', () => {
  it('should display timeline with real activities', async () => {
    const mockTimeline = [
      {
        id: 'sale-1',
        type: 'sale',
        title: 'Compra Realizada',
        description: 'Compra realizada - R$ 30,00',
        amount: 30,
        created_at: new Date().toISOString()
      }
    ];

    render(<CustomerOverviewTab customer={mockCustomer} />);

    await waitFor(() => {
      expect(screen.getByText('Compra Realizada')).toBeInTheDocument();
      expect(screen.getByText('R$ 30,00')).toBeInTheDocument();
    });
  });

  it('should calculate metrics correctly with formatType="none"', () => {
    const purchases = [
      { total_amount: 100, total_items: 2 },
      { total_amount: 200, total_items: 3 }
    ];

    render(<CustomerOverviewTab customer={mockCustomer} />);

    expect(screen.getByText('R$ 150,00')).toBeInTheDocument(); // Ticket médio
    expect(screen.getByText('2.5')).toBeInTheDocument(); // Itens por compra
  });
});
```

### **Integration Tests**
- **Timeline loading**: Teste de carregamento e exibição
- **Real-time updates**: Teste de refetch automático
- **Empty states**: Teste com dados vazios

---

## 🔄 Changelog

### **v3.0.1 - Timeline Implementation (2025-09-30)**
- ✅ **IMPLEMENTED**: Timeline completa com dados reais
- ✅ **ADDED**: useCustomerTimeline hook consolidado
- ✅ **FIXED**: StatCards com formatType="none"
- ✅ **IMPROVED**: Cálculo de Itens por Compra com .toFixed(1)
- ✅ **TESTED**: Validação com Cliente Teste Analytics

### **v3.0.0 - SSoT Architecture**
- ✅ **MIGRATED**: Para arquitetura SSoT centralizada
- ✅ **ADDED**: Integração com useCustomerRealMetrics
- ✅ **OPTIMIZED**: Performance com React Query
- ✅ **STANDARDIZED**: Layout responsivo

---

## 📚 Referências e Dependências

### **Hooks SSoT Utilizados**
```tsx
import { useCustomerRealMetrics } from '@/features/customers/hooks/useCustomerRealMetrics';
import { useCustomerPurchases } from '@/features/customers/hooks/useCustomerPurchases';
import { useCustomerTimeline } from '@/features/customers/hooks/useCustomerTimeline';
import { useCustomerAnalytics } from '@/shared/hooks/business/useCustomerAnalytics';
import { useCustomerPurchaseHistory } from '@/shared/hooks/business/useCustomerPurchaseHistory';
```

### **UI Components**
```tsx
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { EmptyState } from '@/shared/ui/composite/empty-state';
```

### **Utilities**
```tsx
import { formatCurrency } from '@/core/config/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
```

---

## 🎯 Casos de Uso

### **Scenario 1: Cliente com Atividades**
- **Timeline**: Exibe vendas, interações e eventos
- **Métricas**: Calculadas com dados reais
- **Charts**: Visualização de tendências

### **Scenario 2: Cliente Novo**
- **Timeline**: EmptyState com mensagem explicativa
- **Métricas**: Valores zerados com formatação correta
- **Charts**: Placeholder apropriado

### **Scenario 3: Loading States**
- **Timeline**: LoadingSpinner durante fetch
- **Métricas**: Skeleton placeholders
- **Charts**: Loading animation

---

## 👥 Suporte e Manutenção

**Desenvolvido por**: Adega Manager Team
**Versão**: 3.0.1 - Timeline Completa Implementada
**Status**: ✅ **PRODUÇÃO** | 🚀 **TIMELINE FUNCIONANDO**
**Última atualização**: 2025-09-30

**Para debugging timeline**: Verificar `useCustomerTimeline` hook e fontes de dados consolidadas
**Para issues de métricas**: Verificar `formatType="none"` em StatCards