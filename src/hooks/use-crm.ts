import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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

// Hook para obter clientes com suporte a busca e paginação
export const useCustomers = (params?: { 
  search?: string; 
  limit?: number;
  enabled?: boolean;
}) => {
  const { search, limit, enabled = true } = params || {};
  
  return useQuery({
    queryKey: ['customers', { search, limit }],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CustomerProfile[];
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
      let query = supabase
        .from('customer_interactions')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Se um ID de cliente for fornecido, filtrar por esse cliente
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      return data as CustomerInteraction[];
    },
    enabled: true // Sempre habilitado, mesmo sem customerId
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
      queryClient.invalidateQueries({ queryKey: ['customer-interactions', ''] }); // Invalidar a lista de todas as interações
      
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
export const useProfileCompleteness = (customer: CustomerProfile | undefined) => {
  const [completeness, setCompleteness] = useState({
    score: 0,
    suggestions: [] as string[]
  });
  
  useEffect(() => {
    if (!customer) return;
    
    const fields = [
      { name: 'name', label: 'Nome', weight: 15, required: true },
      { name: 'phone', label: 'Telefone', weight: 15, required: true },
      { name: 'email', label: 'Email', weight: 10, required: false },
      { name: 'address', label: 'Endereço', weight: 10, required: false },
      { name: 'birthday', label: 'Data de aniversário', weight: 10, required: false },
      { name: 'contact_preference', label: 'Preferência de contato', weight: 10, required: false },
      { name: 'contact_permission', label: 'Permissão de contato', weight: 15, required: true },
      { name: 'notes', label: 'Observações', weight: 5, required: false },
    ];
    
    let score = 0;
    const suggestions: string[] = [];
    
    fields.forEach(field => {
      if (customer[field.name as keyof CustomerProfile]) {
        score += field.weight;
      } else if (field.required) {
        suggestions.push(`Adicionar ${field.label}`);
      } else {
        suggestions.push(`Completar ${field.label}`);
      }
    });
    
    // Limitar a 3 sugestões
    const topSuggestions = suggestions.slice(0, 3);
    
    setCompleteness({
      score,
      suggestions: topSuggestions
    });
  }, [customer]);
  
  return completeness;
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