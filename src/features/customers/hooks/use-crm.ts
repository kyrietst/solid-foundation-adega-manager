/**
 * @fileoverview Hook principal para operações de CRM (Customer Relationship Management)
 * Gerencia clientes, insights, interações e análises comportamentais
 * 
 * @author Adega Manager Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useProfileCompletenessCalculator } from '@/features/customers/hooks/useProfileCompletenessCalculator';

// Tipos
export type CustomerSegment = 'VIP' | 'Regular' | 'Novo' | 'Inativo' | 'Em risco';
export type ContactPreference = 'whatsapp' | 'sms' | 'email' | 'call';
export type PurchaseFrequency = 'weekly' | 'biweekly' | 'monthly' | 'occasional';
export type InsightType = 'preference' | 'pattern' | 'opportunity' | 'risk';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: any | null;
  birthday: string | null;
  contact_preference: ContactPreference | null;
  contact_permission: boolean;
  first_purchase_date: string | null;
  last_purchase_date: string | null;
  purchase_frequency: PurchaseFrequency | null;
  lifetime_value: number;
  favorite_category: string | null;
  favorite_product: string | null;
  segment: CustomerSegment | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsight {
  id: string;
  customer_id: string;
  insight_type: InsightType;
  insight_value: string;
  confidence: number;
  is_active: boolean;
  created_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  interaction_type: string;
  description: string;
  associated_sale_id: string | null;
  created_by: string;
  created_at: string;
}

// ---------------------
// Eventos & Histórico
// ---------------------
export type CustomerEvent = {
  customer_id: string;
  type: 'sale' | 'movement';
  origin_id: string;
  value: number;
  description?: string;
  created_at?: string; // opcional para inserções manuais
};

/**
 * Registra evento do cliente e recalcula insights automaticamente
 * @param event - Evento do cliente (compra, movimento, etc.)
 * @returns Promise<void>
 * @example
 * ```typescript
 * await recordCustomerEvent({
 *   customer_id: 'uuid',
 *   type: 'sale',
 *   origin_id: 'sale_uuid',
 *   value: 150.00,
 *   description: 'Compra de vinhos'
 * });
 * ```
 */
export const recordCustomerEvent = async (event: CustomerEvent) => {
  if (!event.customer_id) {
    console.warn('recordCustomerEvent: customer_id não fornecido');
    return;
  }
  
  try {
    // Garante timestamp server-side
    const payload = { ...event, created_at: event.created_at ?? new Date().toISOString() };
    const { error } = await supabase.from('customer_history').insert(payload);

    if (error) {
      console.error('Erro ao gravar histórico do cliente:', error);
      // Se for erro de RLS, tenta verificar se é problema de permissão
      if (error.code === '42501') {
        console.warn('Erro de RLS ao inserir customer_history - verificar políticas de segurança');
      }
      throw error; // Re-throw para que o caller possa tratar
    }

    // Tenta recalcular insights, mas não falha se der erro
    try {
      await supabase.rpc('recalc_customer_insights', { p_customer_id: event.customer_id });
    } catch (insightsError) {
      console.warn('Erro ao recalcular insights do cliente (não crítico):', insightsError);
      // Não propaga este erro
    }
  } catch (error) {
    console.error('Erro geral ao registrar evento do cliente:', error);
    throw error; // Re-throw para que o caller possa decidir como tratar
  }
};

export interface CustomerPurchase {
  id: string;
  date: string;
  total: number;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface SaleData {
  id: string;
  customer_id: string;
  total_amount: number;
  created_at: string;
}

// REMOVIDO: Dados mockados eliminados para usar apenas dados reais do Supabase

/**
 * Hook principal para obter lista de clientes com funcionalidades avançadas
 * @param params - Parâmetros de filtro e paginação
 * @param params.search - Termo de busca (nome, email, telefone)
 * @param params.limit - Limite de resultados (padrão: sem limite)
 * @returns Query com lista de clientes e metadados
 * @example
 * ```typescript
 * const { data: customers, isLoading } = useCustomers({ 
 *   search: 'João', 
 *   limit: 50 
 * });
 * ```
 */
export const useCustomers = (params?: { 
  search?: string; 
  limit?: number;
  enabled?: boolean;
}) => {
  const { search, limit, enabled = true } = params || {};
  
  return useQuery({
    queryKey: ['customers', { search, limit }],
    queryFn: async () => {
      try {
        // Buscar clientes reais do banco de dados
        let query = supabase
          .from('customers')
          .select('*')
          .order('name', { ascending: true });
        
        // Aplicar filtro de busca se fornecido
        if (search && search.trim()) {
          const searchTerm = search.trim();
          query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }
        
        // Aplicar limite se fornecido
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('💥 Erro ao buscar clientes do Supabase:', error);
          throw error; // Falhar ao invés de usar dados mockados
        }
        
        // Retornar apenas dados reais do banco (pode ser array vazio)
        return (data as CustomerProfile[]) || [];
        
      } catch (error) {
        console.error('💥 Erro crítico ao buscar clientes:', error);
        throw error; // Propagar erro ao invés de usar dados falsos
      }
    },
    enabled,
    staleTime: 30 * 1000, // 30 segundos de cache
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });
};

// Hook para obter um cliente específico
export const useCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (error) throw error;
      return data as CustomerProfile;
    },
    enabled: !!customerId
  });
};

// Hook para obter insights de um cliente
export const useCustomerInsights = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-insights', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_insights')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CustomerInsight[];
    },
    enabled: !!customerId
  });
};

// Hook para obter todos os insights de clientes
export const useAllCustomerInsights = () => {
  return useQuery({
    queryKey: ['all-customer-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_insights')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CustomerInsight[];
    }
  });
};

// Hook para obter interações de um cliente ou todas as interações
export const useCustomerInteractions = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-interactions', customerId],
    queryFn: async () => {
      // 1. Interações manuais
      let interactionsQuery = supabase
        .from('customer_interactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        interactionsQuery = interactionsQuery.eq('customer_id', customerId);
      }

      const { data: interactions, error: interactionsError } = await interactionsQuery;
      if (interactionsError) throw interactionsError;

      // 2. Movimentações de estoque com cliente associado
      let movementsQuery = supabase
        .from('inventory_movements')
        .select(`id, customer_id, type, quantity, sale_id, date, product_id`)
        .not('customer_id', 'is', null)
        .order('date', { ascending: false });

      if (customerId) {
        movementsQuery = movementsQuery.eq('customer_id', customerId);
      }

      let movements: any[] = [];
      try {
        const { data, error } = await movementsQuery;
        if (error) throw error;
        movements = data ?? [];
      } catch (err) {
        console.error('Erro ao buscar movimentos de estoque', err);
      }

      const movementInteractions: CustomerInteraction[] = movements.map((m) => ({
        id: `mov-${m.id}`,
        customer_id: m.customer_id,
        interaction_type: m.type,
        description: `${m.quantity}x produto #${m.product_id ?? ''} (${m.type})`,
        associated_sale_id: m.sale_id ?? null,
        created_by: 'sistema',
        created_at: m.date,
      }));

      const consolidated = [...(interactions as CustomerInteraction[]), ...movementInteractions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return consolidated;
    },
    enabled: true, // Sempre habilitado, mesmo sem customerId
  });
};

// Hook para criar ou atualizar um cliente
export const useUpsertCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerData: Partial<CustomerProfile>) => {
      const { data, error } = await supabase
        .from('customers')
        .upsert(customerData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as CustomerProfile;
    },
    onSuccess: (data, variables) => {
      // Invalida as queries de clientes para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      // Invalida a query do cliente específico, se ele já existia
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      }

      toast({
        title: `Cliente ${variables.id ? 'atualizado' : 'criado'} com sucesso!`,
        description: `O cliente ${data.name} foi salvo no sistema.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para obter histórico de compras de um cliente
export const useCustomerPurchases = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-purchases', customerId],
    queryFn: async () => {
      // Buscar as vendas do cliente
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          total_amount,
          created_at,
          sale_items (
            product_id,
            quantity,
            unit_price
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (salesError) throw salesError;
      
      // Para cada venda, buscar os detalhes dos produtos
      const purchases: CustomerPurchase[] = [];
      
      for (const sale of sales) {
        const purchaseItems = [];
        
        for (const item of sale.sale_items) {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', item.product_id)
            .single();
            
          purchaseItems.push({
            product_name: product?.name || 'Produto não encontrado',
            quantity: item.quantity,
            unit_price: item.unit_price
          });
        }
        
        purchases.push({
          id: sale.id,
          date: sale.created_at,
          total: sale.total_amount,
          items: purchaseItems
        });
      }
      
      return purchases;
    },
    enabled: !!customerId
  });
};

// Hook para buscar dados de vendas para análise
export const useSalesData = () => {
  return useQuery({
    queryKey: ['sales-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('id, customer_id, total_amount, created_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as SaleData[];
    }
  });
};

// Hook para adicionar uma interação com cliente
export const useAddCustomerInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interaction: Omit<CustomerInteraction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('customer_interactions')
        .insert(interaction)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-interactions', data.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer-interactions', ''] });
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Invalidar a lista de todas as interações
      
      toast({
        title: 'Interação registrada',
        description: 'A interação com o cliente foi registrada com sucesso.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Ocorreu um erro: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
};

// Hook para calcular a completude do perfil do cliente
// Refatorado para usar hook especializado
export const useProfileCompleteness = (customer: CustomerProfile | undefined) => {
  const completeness = useProfileCompletenessCalculator(customer);
  
  // Manter interface compatível com versão anterior
  return {
    score: completeness.score,
    suggestions: completeness.suggestions
  };
};

// Hook para obter estatísticas gerais dos clientes
export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      // Total de clientes
      const { count: totalCustomers, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      // Clientes por segmento
      const { data: segments, error: segmentsError } = await supabase
        .from('customers')
        .select('segment')
        .not('segment', 'is', null);
        
      if (segmentsError) throw segmentsError;
      
      const segmentCounts: Record<string, number> = {};
      segments.forEach(item => {
        const segment = item.segment || 'Não definido';
        segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
      });
      
      // Valor total de vendas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount');
        
      if (salesError) throw salesError;
      
      const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      
      // Ticket médio
      const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
      
      return {
        totalCustomers,
        segmentCounts,
        totalRevenue,
        averageTicket
      };
    }
  });
};

// Alias para useCustomerInteractions - usado para timeline de interações do cliente
export const useCustomerTimeline = useCustomerInteractions;

// Hook para deletar interação do cliente
export const useDeleteCustomerInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interactionId: string) => {
      const { error } = await supabase
        .from('customer_interactions')
        .delete()
        .eq('id', interactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-interactions'] });
      toast({
        title: "Sucesso",
        description: "Interação removida com sucesso"
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar interação:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover interação. Tente novamente.",
        variant: "destructive"
      });
    }
  });
}; 