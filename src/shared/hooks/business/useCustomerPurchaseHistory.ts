/**
 * useCustomerPurchaseHistory.ts - Hook SSoT v3.1.0 Server-Side
 *
 * @description
 * Hook SSoT completo que busca dados diretamente do banco com filtros server-side.
 * Elimina dependência de props e implementa performance otimizada com queries SQL.
 *
 * @features
 * - Busca direta do Supabase (sem props)
 * - Filtros server-side por período e busca
 * - Paginação lazy loading
 * - Cálculos real-time com fallback manual
 * - Cache inteligente com invalidação
 * - Performance otimizada para escalabilidade
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useMemo, useState, useCallback, useEffect } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface PurchaseItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Purchase {
  id: string;
  order_number: number; // Sequential sale number for confirmation
  date: string;
  subtotal: number; // Valor dos produtos (total_amount sem delivery_fee)
  delivery_fee: number; // Taxa de entrega
  total: number; // Total final (subtotal + delivery_fee)
  items: PurchaseItem[];
}

export interface PurchaseFilters {
  searchTerm: string;
  periodFilter: 'all' | '30' | '90' | '180' | '365';
  productSearchTerm?: string; // Server-side product search
}

export interface PurchaseSummary {
  totalSpent: number;
  totalItems: number;
  averageTicket: number;
  purchaseCount: number;
}

export interface BehavioralMetrics {
  avgPurchaseInterval: number;           // Média de dias entre compras
  purchaseIntervalText: string;          // "A cada 15 dias"
  spendingTrend: {
    direction: 'up' | 'stable' | 'down';
    text: string;                        // "↑ Crescendo"
    percentage: number;                  // 15.5
    color: string;                       // Cor para display
  };
  nextPurchaseExpected: {
    daysUntil: number;                   // 5 ou -3 (negativo = atrasada)
    text: string;                        // "Esperada em 5 dias"
    status: 'on-time' | 'soon' | 'overdue';
    color: string;                       // Cor para display
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  hasMore: boolean;
}

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

  // Estados derivados
  hasData: boolean;
  isEmpty: boolean;
  isFiltered: boolean;

  // Refresh manual
  refetch: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// ============================================================================
// HOOK PRINCIPAL SSoT v3.1.0
// ============================================================================

export const useCustomerPurchaseHistory = (
  customerId: string,
  filters: PurchaseFilters,
  pagination: PaginationOptions = { page: 1, limit: 100, hasMore: true }
): PurchaseHistoryOperations => {

  // Estado interno para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedPurchases, setAccumulatedPurchases] = useState<Purchase[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Extrair valores individuais do filters para evitar problemas de dependência
  const { searchTerm, periodFilter, productSearchTerm } = filters;

  // Constante de paginação (evita re-renders desnecessários)
  const PAGINATION_LIMIT = 100;

  // ============================================================================
  // SERVER-SIDE DATA FETCHING
  // ============================================================================

  const {
    data: rawPurchases = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customer-purchase-history', customerId, { searchTerm, periodFilter, productSearchTerm, page: currentPage }],
    queryFn: async (): Promise<Purchase[]> => {
      if (!customerId) return [];

      try {
        // Construir query base
        let query = supabase
          .from('sales')
          .select(`
            id,
            order_number,
            total_amount,
            delivery_fee,
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

        // Aplicar filtro de busca por produto server-side
        if (productSearchTerm && productSearchTerm.trim() !== '') {
          // Usar filtro ilike para busca case-insensitive nos produtos
          query = query
            .ilike('sale_items.products.name', `%${productSearchTerm.trim()}%`);
        }

        // Aplicar filtro de período server-side
        const periodDate = calculatePeriodDate(periodFilter);
        if (periodDate) {
          query = query.gte('created_at', periodDate);
        }

        // Aplicar paginação
        const offset = (currentPage - 1) * pagination.limit;
        query = query.range(offset, offset + pagination.limit - 1);

        const { data: sales, error: salesError } = await query;

        if (salesError) {
          console.error('❌ Erro ao buscar vendas do cliente:', salesError);
          throw salesError;
        }

        if (!sales || sales.length === 0) return [];

        // Processar dados para formato esperado
        const purchases: Purchase[] = sales.map((sale: any) => {
          const items: PurchaseItem[] = sale.sale_items?.map((item: any) => ({
            product_name: item.products?.name || 'Produto não encontrado',
            quantity: item.quantity,
            unit_price: item.unit_price
          })) || [];

          const subtotal = Number(sale.total_amount);
          const deliveryFee = Number(sale.delivery_fee || 0);
          const total = subtotal + deliveryFee;

          return {
            id: sale.id,
            order_number: sale.order_number,
            date: sale.created_at,
            subtotal,
            delivery_fee: deliveryFee,
            total,
            items
          };
        });

        // ============================================================================
        // CLIENT-SIDE FILTERING (legacy searchTerm - deprecated)
        // ============================================================================

        // DEPRECATED: searchTerm is legacy, use productSearchTerm (server-side) instead
        // Manter para compatibilidade, mas encorajar uso de productSearchTerm
        if (searchTerm && !productSearchTerm) {
          return purchases.filter(purchase =>
            purchase.items.some(item =>
              item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
        }

        // Server-side filtering já aplicado via productSearchTerm - retornar dados diretamente
        return purchases;

      } catch (error) {
        console.error('❌ Erro crítico ao buscar histórico de compras:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // 2 minutos auto-refetch
    refetchOnWindowFocus: true,
  });

  // ============================================================================
  // PAGINAÇÃO: ACUMULAÇÃO E RESET
  // ============================================================================

  // Acumular dados quando nova página é carregada
  useEffect(() => {
    // Evitar setState durante loading para prevenir loops
    if (isLoading) return;

    if (rawPurchases && rawPurchases.length > 0) {
      if (currentPage === 1) {
        // Primeira página - substituir tudo
        setAccumulatedPurchases(rawPurchases);
      } else {
        // Páginas subsequentes - adicionar ao final
        setAccumulatedPurchases(prev => [...prev, ...rawPurchases]);
      }

      // Calcular se há mais dados
      setHasMoreData(rawPurchases.length === PAGINATION_LIMIT);
    } else if (currentPage === 1) {
      // Primeira página sem dados - limpar
      setAccumulatedPurchases([]);
      setHasMoreData(false);
    }
  }, [rawPurchases, currentPage, isLoading]);

  // ============================================================================
  // REAL-TIME SUMMARY CALCULATION
  // ============================================================================

  const summary = useMemo((): PurchaseSummary => {
    if (!accumulatedPurchases || accumulatedPurchases.length === 0) {
      return {
        totalSpent: 0,
        totalItems: 0,
        averageTicket: 0,
        purchaseCount: 0
      };
    }

    const totalSpent = accumulatedPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalItems = accumulatedPurchases.reduce((sum, purchase) =>
      sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const purchaseCount = accumulatedPurchases.length;
    const averageTicket = purchaseCount > 0 ? totalSpent / purchaseCount : 0;

    return {
      totalSpent: Number(Math.round(totalSpent * 100) / 100),
      totalItems: Number(totalItems),
      averageTicket: Number(Math.round(averageTicket * 100) / 100),
      purchaseCount: Number(purchaseCount)
    };
  }, [accumulatedPurchases]);

  // ============================================================================
  // BEHAVIORAL METRICS CALCULATION (v3.2.0 - NEW)
  // ============================================================================

  const behavioralMetrics = useMemo((): BehavioralMetrics => {
    // Default values para quando não há dados suficientes
    const defaultMetrics: BehavioralMetrics = {
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
    };

    // Precisa de pelo menos 2 compras para calcular intervalo
    if (!accumulatedPurchases || accumulatedPurchases.length < 2) {
      return defaultMetrics;
    }

    // ============================================================================
    // 1. FREQUÊNCIA DE COMPRA (Average Purchase Interval)
    // ============================================================================

    const intervals: number[] = [];
    for (let i = 1; i < accumulatedPurchases.length; i++) {
      const date1 = new Date(accumulatedPurchases[i - 1].date);
      const date2 = new Date(accumulatedPurchases[i].date);
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
    if (accumulatedPurchases.length >= 6) {
      const recent3 = accumulatedPurchases.slice(0, 3).reduce((sum, p) => sum + p.total, 0);
      const previous3 = accumulatedPurchases.slice(3, 6).reduce((sum, p) => sum + p.total, 0);

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

    const lastPurchaseDate = new Date(accumulatedPurchases[0].date);
    const today = new Date();
    // ✅ CORRIGIDO v3.2.1: Usar Math.ceil para arredondar para cima
    // Math.floor arredondava para baixo (5.54 dias → 5), causando "Atrasada 0 dias"
    // Math.ceil arredonda para cima (5.54 dias → 6), corrigindo para "Atrasada 1 dia"
    const daysSinceLastPurchase = Math.ceil(
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
  }, [accumulatedPurchases]);

  // ============================================================================
  // PAGINATION LOGIC
  // ============================================================================

  const loadMore = useCallback(() => {
    if (hasMoreData && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMoreData, isLoading]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const formatPurchaseDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatPurchaseId = (id: string): string => {
    return `#${id.slice(-8)}`;
  };

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const hasData = accumulatedPurchases && accumulatedPurchases.length > 0;
  const isEmpty = !hasData;
  const isFiltered = searchTerm !== '' || periodFilter !== 'all' || (productSearchTerm !== '' && productSearchTerm !== undefined);

  // ============================================================================
  // RETURN SSoT v3.1.0
  // ============================================================================

  return {
    // Dados do servidor (acumulados)
    purchases: accumulatedPurchases,

    // Estados de carregamento
    isLoading,
    error: error as Error | null,

    // Resumo estatístico (real-time)
    summary,

    // Métricas comportamentais (v3.2.0 - NEW)
    behavioralMetrics,

    // Paginação
    pagination: {
      ...pagination,
      page: currentPage,
      hasMore: hasMoreData
    },
    loadMore,

    // Funções utilitárias
    formatPurchaseDate,
    formatPurchaseId,

    // Refresh manual
    refetch,

    // Estado derivado
    hasData,
    isEmpty,
    isFiltered
  };
};

export default useCustomerPurchaseHistory;