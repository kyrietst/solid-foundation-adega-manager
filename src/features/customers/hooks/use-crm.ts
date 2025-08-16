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
  if (!event.customer_id) return;
  // Garante timestamp server-side
  const payload = { ...event, created_at: event.created_at ?? new Date().toISOString() };
  const { error } = await supabase.from('customer_history').insert(payload);

  if (error) {
    console.error('Erro ao gravar histórico do cliente', error);
    return;
  }

  try {
    await supabase.rpc('recalc_customer_insights', { p_customer_id: event.customer_id });
  } catch (err) {
    console.error('Erro ao recalcular insights do cliente', err);
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

// Datas fixas de aniversário para teste (agosto 2025)
const birthdayDates = {
  // Aniversários próximos em agosto 2025
  today: '1985-08-16',        // Aniversário HOJE
  tomorrow: '1990-08-17',     // Aniversário AMANHÃ  
  threeDays: '1980-08-19',    // Aniversário em 3 dias
  sevenDays: '1988-08-23',    // Aniversário em 7 dias
  fifteenDays: '1992-08-31',  // Aniversário em 15 dias
  twentyFiveDays: '1987-09-10', // Aniversário em 25 dias (setembro)
  
  // Aniversários distantes
  distant1: '1985-03-15',     // Março
  distant2: '1990-07-22',     // Julho 
  distant3: '1978-11-08',     // Novembro
  distant4: '1993-06-07'      // Junho
};

// Dados mockados para teste do CRM Dashboard
const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1234',
    address: { street: 'Rua das Flores', number: '123', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.today, // ANIVERSÁRIO HOJE! 🎉
    contact_preference: 'whatsapp',
    contact_permission: true,
    first_purchase_date: '2024-01-15',
    last_purchase_date: '2024-08-10',
    purchase_frequency: 'monthly',
    lifetime_value: 2850.00,
    favorite_category: 'Vinhos Tintos',
    favorite_product: 'Cabernet Sauvignon',
    segment: 'VIP',
    notes: 'Cliente preferencial, sempre compra vinhos importados',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-08-10T15:30:00Z'
  },
  {
    id: '2',
    name: 'Maria Oliveira Costa',
    email: 'maria.oliveira@outlook.com',
    phone: '(11) 88888-5678',
    address: { street: 'Av. Paulista', number: '456', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.tomorrow, // ANIVERSÁRIO AMANHÃ! 🎂
    contact_preference: 'email',
    contact_permission: true,
    first_purchase_date: '2024-02-20',
    last_purchase_date: '2024-08-05',
    purchase_frequency: 'biweekly',
    lifetime_value: 1850.00,
    favorite_category: 'Vinhos Brancos',
    favorite_product: 'Sauvignon Blanc',
    segment: 'Regular',
    notes: 'Gosta de vinhos para acompanhar peixes',
    created_at: '2024-02-20T14:00:00Z',
    updated_at: '2024-08-05T12:20:00Z'
  },
  {
    id: '3',
    name: 'Pedro Ferreira Lima',
    email: 'pedro.ferreira@gmail.com',
    phone: '(11) 77777-9012',
    address: { street: 'Rua São João', number: '789', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.threeDays, // Aniversário em 3 dias 🎈
    contact_preference: 'call',
    contact_permission: true,
    first_purchase_date: '2023-08-10',
    last_purchase_date: '2024-07-30',
    purchase_frequency: 'monthly',
    lifetime_value: 3200.00,
    favorite_category: 'Whisky',
    favorite_product: 'Single Malt',
    segment: 'VIP',
    notes: 'Colecionador de whisky, compra edições limitadas',
    created_at: '2023-08-10T09:00:00Z',
    updated_at: '2024-07-30T16:45:00Z'
  },
  {
    id: '4',
    name: 'Ana Carolina Souza',
    email: 'ana.souza@company.com',
    phone: '(11) 66666-3456',
    address: { street: 'Rua Augusta', number: '321', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.sevenDays, // Aniversário em 7 dias 🎈
    contact_preference: 'whatsapp',
    contact_permission: true,
    first_purchase_date: '2024-03-12',
    last_purchase_date: '2024-08-12',
    purchase_frequency: 'weekly',
    lifetime_value: 1450.00,
    favorite_category: 'Espumantes',
    favorite_product: 'Prosecco',
    segment: 'Regular',
    notes: 'Organiza eventos, compra espumantes em quantidade',
    created_at: '2024-03-12T11:30:00Z',
    updated_at: '2024-08-12T14:15:00Z'
  },
  {
    id: '5',
    name: 'Carlos Roberto Alves',
    email: 'carlos.alves@business.com',
    phone: '(11) 55555-7890',
    address: { street: 'Av. Faria Lima', number: '654', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.fifteenDays, // Aniversário em 15 dias
    contact_preference: 'email',
    contact_permission: true,
    first_purchase_date: '2023-12-05',
    last_purchase_date: '2024-04-20',
    purchase_frequency: 'occasional',
    lifetime_value: 950.00,
    favorite_category: 'Cervejas Artesanais',
    favorite_product: 'IPA',
    segment: 'Em risco',
    notes: 'Não compra há mais de 3 meses, precisa de atenção',
    created_at: '2023-12-05T13:20:00Z',
    updated_at: '2024-04-20T10:30:00Z'
  },
  {
    id: '6',
    name: 'Fernanda Dias Rodrigues',
    email: 'fernanda.dias@email.com',
    phone: '(11) 44444-2468',
    address: { street: 'Rua Consolação', number: '987', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.twentyFiveDays, // Aniversário em 25 dias
    contact_preference: 'sms',
    contact_permission: true,
    first_purchase_date: '2024-06-01',
    last_purchase_date: '2024-08-14',
    purchase_frequency: 'biweekly',
    lifetime_value: 650.00,
    favorite_category: 'Rosé',
    favorite_product: 'Rosé Francês',
    segment: 'Novo',
    notes: 'Cliente nova, interessada em vinhos rosé',
    created_at: '2024-06-01T16:45:00Z',
    updated_at: '2024-08-14T11:20:00Z'
  },
  {
    id: '7',
    name: 'Roberto Santos Silva',
    email: 'roberto.santos@corp.com',
    phone: '(11) 33333-1357',
    address: { street: 'Rua Bela Vista', number: '147', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.distant1, // Aniversário distante (março)
    contact_preference: 'call',
    contact_permission: false,
    first_purchase_date: '2023-05-20',
    last_purchase_date: '2023-12-15',
    purchase_frequency: 'occasional',
    lifetime_value: 450.00,
    favorite_category: 'Aguardente',
    favorite_product: 'Cachaça Premium',
    segment: 'Inativo',
    notes: 'Cliente inativo há mais de 8 meses',
    created_at: '2023-05-20T08:30:00Z',
    updated_at: '2023-12-15T17:10:00Z'
  },
  {
    id: '8',
    name: 'Juliana Melo Pereira',
    email: 'juliana.melo@startup.io',
    phone: '(11) 22222-9753',
    address: { street: 'Rua Itaim', number: '258', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.distant2, // Aniversário distante (julho)
    contact_preference: 'whatsapp',
    contact_permission: true,
    first_purchase_date: '2024-01-08',
    last_purchase_date: '2024-08-11',
    purchase_frequency: 'monthly',
    lifetime_value: 2100.00,
    favorite_category: 'Vinhos Tintos',
    favorite_product: 'Malbec Argentino',
    segment: 'Regular',
    notes: 'Aprecia vinhos sul-americanos, especialmente argentinos',
    created_at: '2024-01-08T12:15:00Z',
    updated_at: '2024-08-11T13:45:00Z'
  },
  {
    id: '9',
    name: 'Luiz Fernando Oliveira',
    email: 'luiz.fernando@tech.com',
    phone: '(11) 11111-8642',
    address: { street: 'Av. Brigadeiro', number: '369', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.distant3, // Aniversário distante (novembro)
    contact_preference: 'email',
    contact_permission: true,
    first_purchase_date: '2023-11-20',
    last_purchase_date: '2024-08-08',
    purchase_frequency: 'weekly',
    lifetime_value: 3850.00,
    favorite_category: 'Vinhos Tintos',
    favorite_product: 'Bordeaux',
    segment: 'VIP',
    notes: 'Conhecedor de vinhos franceses, cliente premium',
    created_at: '2023-11-20T15:30:00Z',
    updated_at: '2024-08-08T09:20:00Z'
  },
  {
    id: '10',
    name: 'Beatriz Costa Lima',
    email: 'beatriz.costa@design.com',
    phone: '(11) 99999-7531',
    address: { street: 'Rua Oscar Freire', number: '741', city: 'São Paulo', state: 'SP' },
    birthday: birthdayDates.distant4, // Aniversário distante (junho)
    contact_preference: 'whatsapp',
    contact_permission: true,
    first_purchase_date: '2024-07-15',
    last_purchase_date: '2024-08-13',
    purchase_frequency: 'biweekly',
    lifetime_value: 320.00,
    favorite_category: 'Espumantes',
    favorite_product: 'Champagne',
    segment: 'Novo',
    notes: 'Cliente nova, prefere espumantes importados',
    created_at: '2024-07-15T10:45:00Z',
    updated_at: '2024-08-13T14:30:00Z'
  }
];

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
      // Para teste, usar dados mockados primeiro
      let filteredCustomers = [...MOCK_CUSTOMERS];
      
      // Aplicar filtro de busca se fornecido
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCustomers = MOCK_CUSTOMERS.filter(customer => 
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower)
        );
      }
      
      // Aplicar limite se fornecido
      if (limit) {
        filteredCustomers = filteredCustomers.slice(0, limit);
      }
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Para teste, sempre usar dados mockados
      
      // Retornar dados mockados
      return filteredCustomers;
    },
    enabled
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