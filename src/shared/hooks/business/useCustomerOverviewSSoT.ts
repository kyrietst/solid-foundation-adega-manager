/**
 * useCustomerOverviewSSoT.ts - Hook SSoT v3.1.0 Server-Side
 *
 * @description
 * Hook SSoT completo que consolida TODOS os dados para a visão geral do cliente.
 * Elimina dependência de props e implementa performance otimizada com queries consolidadas.
 *
 * @features
 * - Busca consolidada de customer, metrics, purchases, timeline
 * - Cálculos real-time de status, completude e preferências
 * - Handlers centralizados para comunicação e edição
 * - Cache inteligente com invalidação coordenada
 * - Performance otimizada para escalabilidade
 * - Elimina múltiplas dependencies e hooks externos
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useMemo, useCallback } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface CustomerOverviewData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  segment?: string;
  contact_preference?: string;
  contact_permission?: boolean;
}

export interface CustomerMetricsData {
  total_purchases: number;
  total_spent: number;
  lifetime_value_calculated: number;
  avg_purchase_value: number;
  avg_items_per_purchase: number;
  total_products_bought: number;
  last_purchase_real?: string;
  days_since_last_purchase?: number;
  calculated_favorite_category?: string;
  calculated_favorite_product?: string;
  insights_count: number;
  insights_confidence: number;
  data_sync_status: {
    ltv_synced: boolean;
    dates_synced: boolean;
    preferences_synced: boolean;
  };
}

export interface PurchaseOverviewData {
  id: string;
  date: string;
  total: number;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface TimelineOverviewData {
  id: string;
  type: 'sale' | 'interaction' | 'event';
  title: string;
  description: string;
  amount?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CustomerStatus {
  status: string;
  className: string;
  engagementLevel: string;
}

export interface MissingField {
  key: string;
  label: string;
  value?: string;
  required: boolean;
  icon: any;
  impact: string;
}

export interface FinancialSummary {
  totalSpent: number;
  averageTicket: number;
  totalPurchases: number;
  lifetimeValue: number;
  syncStatus: {
    ltv_synced: boolean;
    dates_synced: boolean;
  };
}

export interface EngagementMetrics {
  lastPurchaseDate?: string;
  daysSinceLastPurchase?: number;
  status: CustomerStatus;
  timelineCount: number;
}

export interface CustomerPreferences {
  favoriteCategory?: string;
  favoriteProduct?: string;
  insightsCount: number;
  insightsConfidence: number;
  segment?: string;
  syncStatus: {
    preferences_synced: boolean;
  };
}

export interface CustomerOverviewOperations {
  // Dados consolidados do servidor
  customer: CustomerOverviewData | null;
  metrics: CustomerMetricsData | null;
  purchases: PurchaseOverviewData[];
  timeline: TimelineOverviewData[];

  // Estados de carregamento
  isLoading: boolean;
  error: Error | null;

  // Handlers centralizados
  sendWhatsApp: () => Promise<void>;
  sendEmail: () => Promise<void>;
  editProfile: () => void;

  // Cálculos derivados
  profileCompleteness: number;
  customerStatus: CustomerStatus;
  missingCriticalFields: MissingField[];

  // Analytics consolidadas
  financialSummary: FinancialSummary;
  engagementMetrics: EngagementMetrics;
  preferences: CustomerPreferences;

  // Estado derivado
  hasData: boolean;
  isEmpty: boolean;
  hasCriticalMissing: boolean;
  hasContactInfo: boolean;
  hasPhoneNumber: boolean;
  hasEmailAddress: boolean;

  // Refresh
  refetch: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REPORT_FIELDS = [
  {
    key: 'email',
    label: 'Email',
    required: true,
    icon: 'Mail',
    impact: 'Necessário para campanhas de email marketing e relatórios de comunicação.'
  },
  {
    key: 'phone',
    label: 'Telefone',
    required: true,
    icon: 'Phone',
    impact: 'Essencial para relatórios de WhatsApp e análises de contato.'
  },
  {
    key: 'address',
    label: 'Endereço',
    required: false,
    icon: 'MapPin',
    impact: 'Importante para análises geográficas e relatórios de entrega.'
  }
];

// ============================================================================
// HOOK PRINCIPAL SSoT v3.1.0
// ============================================================================

export const useCustomerOverviewSSoT = (
  customerId: string
): CustomerOverviewOperations => {

  const queryClient = useQueryClient();

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - CUSTOMER DATA
  // ============================================================================

  const {
    data: customer = null,
    isLoading: isLoadingCustomer,
    error: customerError,
    refetch: refetchCustomer
  } = useQuery({
    queryKey: ['customer-overview-data', customerId],
    queryFn: async (): Promise<CustomerOverviewData | null> => {
      if (!customerId) return null;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            email,
            phone,
            address,
            notes,
            created_at,
            updated_at,
            segment,
            contact_preference,
            contact_permission
          `)
          .eq('id', customerId)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar dados do cliente para overview:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('❌ Erro crítico ao buscar cliente para overview:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 min cache para dados de cliente
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - METRICS DATA
  // ============================================================================

  const {
    data: metrics = null,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['customer-overview-metrics', customerId],
    queryFn: async (): Promise<CustomerMetricsData | null> => {
      if (!customerId) return null;

      try {
        // Buscar métricas calculadas (implementar RPC ou cálculo manual)
        // Por enquanto, implementação básica com cálculos manuais
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            total_amount,
            created_at,
            sale_items (
              quantity,
              unit_price,
              products (
                name,
                category
              )
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (salesError) {
          console.error('❌ Erro ao buscar vendas para métricas:', salesError);
          throw salesError;
        }

        const purchases = sales || [];
        const totalPurchases = purchases.length;
        const totalSpent = purchases.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0);
        const avgPurchaseValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

        const totalItems = purchases.reduce((sum, sale) =>
          sum + (sale.sale_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
        );
        const avgItemsPerPurchase = totalPurchases > 0 ? totalItems / totalPurchases : 0;

        const lastPurchaseReal = purchases.length > 0 ? purchases[0].created_at : undefined;
        const daysSinceLastPurchase = lastPurchaseReal
          ? Math.floor((new Date().getTime() - new Date(lastPurchaseReal).getTime()) / (1000 * 60 * 60 * 24))
          : undefined;

        // Calcular categoria favorita e produto favorito baseados nos produtos mais comprados
        let calculatedFavoriteCategory = 'Não definida';
        let calculatedFavoriteProduct = 'Não definido';

        if (sales && sales.length > 0) {
          const categoryCounts: Record<string, number> = {};
          const productCounts: Record<string, number> = {};

          sales.forEach((sale: any) => {
            sale.sale_items?.forEach((item: any) => {
              const category = item.products?.category;
              const productName = item.products?.name;

              if (category) {
                categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
              }
              if (productName) {
                productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
              }
            });
          });

          // Encontrar categoria mais comprada
          const categoryEntries = Object.entries(categoryCounts);
          if (categoryEntries.length > 0) {
            const topCategory = categoryEntries.sort(([,a], [,b]) => b - a)[0];
            calculatedFavoriteCategory = topCategory[0];
          }

          // Encontrar produto mais comprado
          const productEntries = Object.entries(productCounts);
          if (productEntries.length > 0) {
            const topProduct = productEntries.sort(([,a], [,b]) => b - a)[0];
            calculatedFavoriteProduct = topProduct[0];
          }
        }

        return {
          total_purchases: totalPurchases,
          total_spent: totalSpent,
          lifetime_value_calculated: totalSpent, // Simplificado por agora
          avg_purchase_value: avgPurchaseValue,
          avg_items_per_purchase: avgItemsPerPurchase,
          total_products_bought: totalItems,
          last_purchase_real: lastPurchaseReal,
          days_since_last_purchase: daysSinceLastPurchase,
          calculated_favorite_category: calculatedFavoriteCategory,
          calculated_favorite_product: calculatedFavoriteProduct,
          insights_count: 0, // TODO: Buscar de customer_insights
          insights_confidence: 0,
          data_sync_status: {
            ltv_synced: true,
            dates_synced: true,
            preferences_synced: false, // TODO: Implementar sincronização
          },
        };
      } catch (error) {
        console.error('❌ Erro crítico ao calcular métricas:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 min cache para métricas
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 min
    refetchOnWindowFocus: true,
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - PURCHASES DATA
  // ============================================================================

  const {
    data: purchases = [],
    isLoading: isLoadingPurchases,
    error: purchasesError,
    refetch: refetchPurchases
  } = useQuery({
    queryKey: ['customer-overview-purchases', customerId],
    queryFn: async (): Promise<PurchaseOverviewData[]> => {
      if (!customerId) return [];

      try {
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            created_at,
            total_amount,
            sale_items (
              quantity,
              unit_price,
              products (
                name
              )
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(20); // Últimas 20 compras para overview

        if (salesError) {
          console.error('❌ Erro ao buscar compras para overview:', salesError);
          throw salesError;
        }

        return (sales || []).map(sale => ({
          id: sale.id,
          date: sale.created_at,
          total: parseFloat(sale.total_amount || '0'),
          items: (sale.sale_items || []).map(item => ({
            product_name: item.products?.name || 'Produto desconhecido',
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price || '0')
          }))
        }));
      } catch (error) {
        console.error('❌ Erro crítico ao buscar compras para overview:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 1 * 60 * 1000, // 1 min cache para compras
    refetchInterval: 3 * 60 * 1000, // Auto-refresh a cada 3 min
    refetchOnWindowFocus: true,
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - TIMELINE DATA
  // ============================================================================

  const {
    data: timeline = [],
    isLoading: isLoadingTimeline,
    error: timelineError,
    refetch: refetchTimeline
  } = useQuery({
    queryKey: ['customer-overview-timeline', customerId],
    queryFn: async (): Promise<TimelineOverviewData[]> => {
      if (!customerId) return [];

      try {
        const activities: TimelineOverviewData[] = [];

        // Buscar vendas para timeline
        const { data: sales } = await supabase
          .from('sales')
          .select('id, total_amount, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(10);

        (sales || []).forEach(sale => {
          activities.push({
            id: `sale-${sale.id}`,
            type: 'sale',
            title: 'Compra realizada',
            description: `Compra #${sale.id.slice(-8)} finalizada`,
            amount: parseFloat(sale.total_amount || '0'),
            created_at: sale.created_at,
          });
        });

        // Buscar interações para timeline
        const { data: interactions } = await supabase
          .from('customer_interactions')
          .select('id, interaction_type, description, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(10);

        (interactions || []).forEach(interaction => {
          activities.push({
            id: `interaction-${interaction.id}`,
            type: 'interaction',
            title: `Interação: ${interaction.interaction_type}`,
            description: interaction.description,
            created_at: interaction.created_at,
          });
        });

        // Buscar eventos para timeline
        const { data: events } = await supabase
          .from('customer_events')
          .select('id, source, payload, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(5);

        (events || []).forEach(event => {
          activities.push({
            id: `event-${event.id}`,
            type: 'event',
            title: `Evento: ${event.source}`,
            description: 'Evento do sistema registrado',
            created_at: event.created_at,
            metadata: event.payload,
          });
        });

        // Ordenar todas as atividades por data
        return activities.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 15); // Top 15 atividades

      } catch (error) {
        console.error('❌ Erro crítico ao buscar timeline para overview:', error);
        return [];
      }
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 min cache para timeline
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 min
    refetchOnWindowFocus: true,
  });

  // ============================================================================
  // HANDLERS CENTRALIZADOS
  // ============================================================================

  const sendWhatsApp = useCallback(async () => {
    if (!customer?.phone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }

    const phone = customer.phone.replace(/\D/g, '');
    const message = `Olá ${customer.name}, tudo bem? Aqui é da Adega! 🍷`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

    // Registrar interação (se hook de comunicação estiver disponível)
    try {
      await supabase
        .from('customer_interactions')
        .insert([{
          customer_id: customerId,
          interaction_type: 'whatsapp',
          description: `WhatsApp enviado: ${message}`,
        }]);

      // Invalidar cache de timeline para atualizar
      queryClient.invalidateQueries({ queryKey: ['customer-overview-timeline', customerId] });
    } catch (error) {
      console.error('❌ Erro ao registrar interação de WhatsApp:', error);
    }
  }, [customer, customerId, queryClient]);

  const sendEmail = useCallback(async () => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }

    const subject = 'Contato - Adega Wine Store';
    const body = `Prezado(a) ${customer.name},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega`;
    const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(url, '_blank');

    // Registrar interação
    try {
      await supabase
        .from('customer_interactions')
        .insert([{
          customer_id: customerId,
          interaction_type: 'email',
          description: `Email enviado: ${subject}`,
        }]);

      // Invalidar cache de timeline para atualizar
      queryClient.invalidateQueries({ queryKey: ['customer-overview-timeline', customerId] });
    } catch (error) {
      console.error('❌ Erro ao registrar interação de email:', error);
    }
  }, [customer, customerId, queryClient]);

  const editProfile = useCallback(() => {
    // TODO: Implementar modal de edição ou navegação
    console.log('Editar perfil do cliente:', customerId);
  }, [customerId]);

  // ============================================================================
  // CÁLCULOS DERIVADOS
  // ============================================================================

  const profileCompleteness = useMemo((): number => {
    if (!customer) return 0;

    let completeness = 0;
    const weights = {
      email: 25,
      phone: 25,
      address: 20,
      hasRealPurchases: 20,
      hasInsights: 10
    };

    if (customer.email) completeness += weights.email;
    if (customer.phone) completeness += weights.phone;
    if (customer.address) completeness += weights.address;
    if (metrics?.total_purchases && metrics.total_purchases > 0) {
      completeness += weights.hasRealPurchases;
    }
    if (metrics?.insights_count && metrics.insights_count > 0) {
      completeness += weights.hasInsights;
    }

    return completeness;
  }, [customer, metrics]);

  const customerStatus = useMemo((): CustomerStatus => {
    if (!metrics) {
      return {
        status: 'Carregando...',
        className: 'border-gray-500/30 text-gray-400',
        engagementLevel: 'Calculando...'
      };
    }

    const daysSinceLastPurchase = metrics.days_since_last_purchase;
    const totalPurchases = metrics.total_purchases || 0;
    const lifetimeValue = metrics.lifetime_value_calculated || 0;

    if (totalPurchases === 0) {
      return {
        status: 'Novo',
        className: 'border-blue-500/30 text-blue-400',
        engagementLevel: 'Baixo'
      };
    }

    if (lifetimeValue >= 1000 && totalPurchases >= 5) {
      return {
        status: 'VIP',
        className: 'border-yellow-500/30 text-yellow-400',
        engagementLevel: 'Alto'
      };
    }

    if (daysSinceLastPurchase !== undefined) {
      if (daysSinceLastPurchase <= 30) {
        return {
          status: 'Ativo',
          className: 'border-green-500/30 text-green-400',
          engagementLevel: 'Alto'
        };
      }
      if (daysSinceLastPurchase <= 90) {
        return {
          status: 'Regular',
          className: 'border-yellow-500/30 text-yellow-400',
          engagementLevel: 'Médio'
        };
      }
      return {
        status: 'Dormindo',
        className: 'border-red-500/30 text-red-400',
        engagementLevel: 'Baixo'
      };
    }

    return {
      status: 'Indefinido',
      className: 'border-gray-500/30 text-gray-400',
      engagementLevel: 'Baixo'
    };
  }, [metrics]);

  const missingCriticalFields = useMemo((): MissingField[] => {
    if (!customer) return [];

    return REPORT_FIELDS
      .filter(field => {
        const value = customer[field.key as keyof CustomerOverviewData];
        return !value || value === 'N/A' || value === 'Não definida';
      })
      .filter(field => field.required)
      .map(field => ({
        key: field.key,
        label: field.label,
        value: customer[field.key as keyof CustomerOverviewData] as string,
        required: field.required,
        icon: field.icon,
        impact: field.impact,
      }));
  }, [customer]);

  // ============================================================================
  // ANALYTICS CONSOLIDADAS
  // ============================================================================

  const financialSummary = useMemo((): FinancialSummary => {
    return {
      totalSpent: metrics?.total_spent || 0,
      averageTicket: metrics?.avg_purchase_value || 0,
      totalPurchases: metrics?.total_purchases || 0,
      lifetimeValue: metrics?.lifetime_value_calculated || 0,
      syncStatus: {
        ltv_synced: metrics?.data_sync_status.ltv_synced || false,
        dates_synced: metrics?.data_sync_status.dates_synced || false,
      },
    };
  }, [metrics]);

  const engagementMetrics = useMemo((): EngagementMetrics => {
    return {
      lastPurchaseDate: metrics?.last_purchase_real,
      daysSinceLastPurchase: metrics?.days_since_last_purchase,
      status: customerStatus,
      timelineCount: timeline.length,
    };
  }, [metrics, customerStatus, timeline.length]);

  const preferences = useMemo((): CustomerPreferences => {
    return {
      favoriteCategory: metrics?.calculated_favorite_category,
      favoriteProduct: metrics?.calculated_favorite_product,
      insightsCount: metrics?.insights_count || 0,
      insightsConfidence: metrics?.insights_confidence || 0,
      segment: customer?.segment,
      syncStatus: {
        preferences_synced: metrics?.data_sync_status.preferences_synced || false,
      },
    };
  }, [metrics, customer?.segment]);

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const isLoading = isLoadingCustomer || isLoadingMetrics || isLoadingPurchases || isLoadingTimeline;
  const error = customerError || metricsError || purchasesError || timelineError;

  const hasPhoneNumber = !!(customer?.phone && customer.phone.trim() !== '');
  const hasEmailAddress = !!(customer?.email && customer.email.trim() !== '');
  const hasContactInfo = hasPhoneNumber || hasEmailAddress;

  const hasData = !!customer;
  const isEmpty = !hasData;
  const hasCriticalMissing = missingCriticalFields.length > 0;

  const refetch = useCallback(() => {
    refetchCustomer();
    refetchMetrics();
    refetchPurchases();
    refetchTimeline();
  }, [refetchCustomer, refetchMetrics, refetchPurchases, refetchTimeline]);

  // ============================================================================
  // RETURN SSoT v3.1.0
  // ============================================================================

  return {
    // Dados consolidados do servidor
    customer,
    metrics,
    purchases,
    timeline,

    // Estados de carregamento
    isLoading,
    error: error as Error | null,

    // Handlers centralizados
    sendWhatsApp,
    sendEmail,
    editProfile,

    // Cálculos derivados
    profileCompleteness,
    customerStatus,
    missingCriticalFields,

    // Analytics consolidadas
    financialSummary,
    engagementMetrics,
    preferences,

    // Estado derivado
    hasData,
    isEmpty,
    hasCriticalMissing,
    hasContactInfo,
    hasPhoneNumber,
    hasEmailAddress,

    // Refresh
    refetch,
  };
};

export default useCustomerOverviewSSoT;