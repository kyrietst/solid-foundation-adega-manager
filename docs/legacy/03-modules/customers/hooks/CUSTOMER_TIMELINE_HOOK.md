# useCustomerTimeline Hook - SSoT Timeline Implementation

## 📋 Overview

O **useCustomerTimeline** é um hook SSoT v3.0.0 dedicado que centraliza TODAS as atividades do cliente, consolidando múltiplas fontes de dados em uma timeline unificada com formatação padronizada e cache inteligente.

---

## 🏗️ Arquitetura do Hook

### **Localização**
```
/src/features/customers/hooks/useCustomerTimeline.ts
```

### **Propósito Principal**
Consolidar em uma única fonte de verdade:
- **Vendas (sales)** - Transações realizadas pelo cliente
- **Interações manuais (customer_interactions)** - Comunicações registradas
- **Eventos do sistema (customer_events)** - Atividades automáticas

### **Versão**: 3.0.0 - Timeline Completa

---

## 🎯 Implementação Completa

### **Interface Principal**
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

export const useCustomerTimeline = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-timeline', customerId],
    queryFn: async (): Promise<TimelineActivity[]> => {
      // Implementação completa...
    },
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
};
```

---

## 🔄 Consolidação de Múltiplas Fontes

### **1. Parallel Data Fetching**
```tsx
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
```

### **2. Sales Processing**
```tsx
// Processar VENDAS
if (salesResult.status === 'fulfilled' && salesResult.value.data) {
  const sales = salesResult.value.data;
  sales.forEach((sale: any) => {
    activities.push({
      id: `sale-${sale.id}`,
      type: 'sale',
      title: 'Compra Realizada',
      description: `Compra realizada - R$ ${Number(sale.total_amount).toFixed(2)}`,
      amount: Number(sale.total_amount),
      created_at: sale.created_at,
      metadata: {
        sale_id: sale.id
      }
    });
  });
}
```

### **3. Interactions Processing**
```tsx
// Processar INTERAÇÕES
if (interactionsResult.status === 'fulfilled' && interactionsResult.value.data) {
  const interactions = interactionsResult.value.data;
  interactions.forEach((interaction: any) => {
    activities.push({
      id: `interaction-${interaction.id}`,
      type: 'interaction',
      title: interaction.interaction_type,
      description: interaction.description,
      created_at: interaction.created_at,
      metadata: {
        interaction_type: interaction.interaction_type
      }
    });
  });
}
```

### **4. Events Processing**
```tsx
// Processar EVENTOS
if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
  const events = eventsResult.value.data;
  events.forEach((event: any) => {
    const payload = event.payload || {};
    const description = payload.description || 'Evento registrado';

    activities.push({
      id: `event-${event.id}`,
      type: 'event',
      title: 'Evento do Sistema',
      description: description,
      created_at: event.created_at,
      metadata: {
        event_source: event.source
      }
    });
  });
}
```

---

## 📊 Formatação e Ordenação

### **Timeline Sorting**
```tsx
// Ordenar todas as atividades por data (mais recente primeiro)
const sortedActivities = activities.sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

// Limitar a 20 atividades mais recentes para performance
return sortedActivities.slice(0, 20);
```

### **Error Handling**
```tsx
try {
  // Lógica de consolidação...
} catch (error) {
  console.error('❌ Erro ao buscar timeline do cliente:', error);
  throw error;
}
```

---

## ⚡ Performance e Cache

### **React Query Configuration**
```tsx
{
  queryKey: ['customer-timeline', customerId],
  enabled: !!customerId, // Só executa se customerId existir
  staleTime: 30 * 1000, // Cache válido por 30 segundos
  refetchInterval: 2 * 60 * 1000, // Refetch automático a cada 2 minutos
  refetchOnWindowFocus: true, // Atualiza quando volta para a janela
}
```

### **Benefits da Configuração**
- **Cache inteligente**: Evita requests desnecessários
- **Auto-refresh**: Dados sempre atualizados
- **Performance**: Máximo 20 atividades para UI responsiva
- **Error resilience**: Promise.allSettled para tolerância a falhas

---

## 🔧 Casos de Uso Reais

### **Scenario 1: Cliente com Múltiplas Atividades**
```tsx
// Input data sources:
// - Sales: [{ id: '123', total_amount: 30, created_at: '2025-09-30T...' }]
// - Interactions: [{ id: '456', interaction_type: 'Ligação Telefônica', description: 'Contato para promoção' }]
// - Events: [{ id: '789', source: 'sale', payload: { description: 'Documento enviado' } }]

// Output timeline:
[
  {
    id: 'sale-123',
    type: 'sale',
    title: 'Compra Realizada',
    description: 'Compra realizada - R$ 30.00',
    amount: 30,
    created_at: '2025-09-30T...',
    metadata: { sale_id: '123' }
  },
  {
    id: 'interaction-456',
    type: 'interaction',
    title: 'Ligação Telefônica',
    description: 'Contato para promoção',
    created_at: '2025-09-30T...',
    metadata: { interaction_type: 'Ligação Telefônica' }
  },
  // ... mais atividades ordenadas por data
]
```

### **Scenario 2: Cliente Novo**
```tsx
// Input: Nenhuma atividade em nenhuma tabela
// Output: [] (array vazio)
// UI: EmptyState é exibido no CustomerOverviewTab
```

### **Scenario 3: Erro em Uma Fonte**
```tsx
// Sales: ✅ Sucesso
// Interactions: ❌ Erro de rede
// Events: ✅ Sucesso

// Result: Timeline com sales + events (interactions ignoradas)
// Promise.allSettled garante que outras fontes funcionem
```

---

## 🧪 Testing Strategy

### **Unit Tests**
```tsx
describe('useCustomerTimeline', () => {
  it('should consolidate multiple data sources', async () => {
    const mockSales = [{ id: '1', total_amount: 100, created_at: '2025-09-30' }];
    const mockInteractions = [{ id: '2', interaction_type: 'Email', description: 'Follow-up' }];

    mockSupabase
      .from('sales').select().eq().order().mockResolvedValue({ data: mockSales })
      .from('customer_interactions').select().eq().order().mockResolvedValue({ data: mockInteractions });

    const { result } = renderHook(() => useCustomerTimeline('customer-id'));

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].type).toBe('sale');
      expect(result.current.data[1].type).toBe('interaction');
    });
  });

  it('should handle empty data sources gracefully', async () => {
    mockSupabase.from().select().mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useCustomerTimeline('customer-id'));

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  it('should sort activities by created_at desc', async () => {
    const mockActivities = [
      { created_at: '2025-09-29T10:00:00Z' },
      { created_at: '2025-09-30T10:00:00Z' }, // Mais recente
      { created_at: '2025-09-28T10:00:00Z' }
    ];

    const { result } = renderHook(() => useCustomerTimeline('customer-id'));

    await waitFor(() => {
      expect(result.current.data[0].created_at).toBe('2025-09-30T10:00:00Z');
      expect(result.current.data[2].created_at).toBe('2025-09-28T10:00:00Z');
    });
  });
});
```

### **Integration Tests**
```tsx
describe('useCustomerTimeline Integration', () => {
  it('should work with real Supabase client', async () => {
    // Test with real database connection
    const { result } = renderHook(() => useCustomerTimeline('real-customer-id'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeDefined();
    });
  });

  it('should refetch on window focus', async () => {
    const { result } = renderHook(() => useCustomerTimeline('customer-id'));

    // Simulate window focus
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    // Should trigger a refetch
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## 🔄 Migration History

### **v3.0.0 - Criação do Hook (2025-09-30)**

**❌ Problema Anterior:**
```tsx
// Timeline vazia com placeholder
<div className="text-gray-400 text-center py-8">
  📅 Timeline integrada será implementada na próxima versão...
</div>

// useCustomerTimeline era apenas alias para useCustomerInteractions
export const useCustomerTimeline = useCustomerInteractions; // ❌ Limitado
```

**✅ Solução Implementada:**
```tsx
// Hook dedicado consolidando múltiplas fontes
export const useCustomerTimeline = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-timeline', customerId],
    queryFn: async () => {
      // Consolidação de sales + interactions + events
      const [salesResult, interactionsResult, eventsResult] = await Promise.allSettled([...]);
      // Processamento e formatação padronizada
      return sortedActivities.slice(0, 20);
    }
  });
};
```

**Resultados:**
- ✅ **Timeline funcional** com dados reais de 3 fontes
- ✅ **Performance otimizada** com cache e limite de 20 itens
- ✅ **Error resilience** com Promise.allSettled
- ✅ **Real-time updates** com refetch automático

---

## 📚 Dependências e Imports

### **Core Dependencies**
```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
```

### **Type Definitions**
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

### **Usage in Components**
```tsx
// CustomerOverviewTab.tsx
import { useCustomerTimeline } from '@/features/customers/hooks/useCustomerTimeline';

const { data: timeline = [], isLoading: timelineLoading } = useCustomerTimeline(customerId || '');
```

---

## 🚀 Future Enhancements

### **v3.1 Planned Features**
1. **Pagination Support**: Carregar mais atividades sob demanda
2. **Activity Filtering**: Filtrar por tipo de atividade
3. **Real-time Subscriptions**: Supabase real-time para updates instantâneos
4. **Activity Details**: Modal com detalhes expandidos de cada atividade

### **v3.2 Advanced Features**
1. **AI Insights**: Análise de padrões na timeline
2. **Export Functionality**: Exportar timeline para PDF/Excel
3. **Activity Analytics**: Métricas sobre frequência e tipos de atividade
4. **Notifications**: Alertas para atividades importantes

---

## 🔧 Troubleshooting

### **Issue 1: Timeline Vazia**
```tsx
// Debug checklist:
1. Verificar se customerId não é null/undefined
2. Verificar permissões RLS nas tabelas: sales, customer_interactions, customer_events
3. Verificar se há dados reais nas tabelas para o cliente
4. Verificar console.error para erros de query
```

### **Issue 2: Performance Lenta**
```tsx
// Soluções:
1. Verificar se staleTime está configurado (30s)
2. Confirmar limite de 20 atividades
3. Verificar índices no banco para customer_id
4. Considerar implementar paginação
```

### **Issue 3: Dados Desatualizados**
```tsx
// Verificações:
1. Confirmar refetchInterval (2 minutos)
2. Verificar refetchOnWindowFocus (true)
3. Manualmente invalidar query: queryClient.invalidateQueries(['customer-timeline'])
4. Verificar cache browser/network
```

---

## 👥 Team and Support

**Desenvolvido por**: Adega Manager Team
**Arquitetura**: SSoT (Single Source of Truth) v3.0.0
**Status**: ✅ **PRODUCTION READY** | 🚀 **TIMELINE FUNCIONANDO**
**Última atualização**: 2025-09-30

**Para suporte técnico**: Verificar logs do Supabase e invalidação de cache React Query
**Para novos tipos de atividade**: Estender interface TimelineActivity e adicionar processamento na queryFn