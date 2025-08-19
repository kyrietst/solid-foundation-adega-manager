/**
 * Hooks para gestão de lotes de produtos
 * Sistema de controle de validade com FEFO
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/core/api/supabase/client';
import type { 
  ProductBatch, 
  BatchFormData, 
  BatchSaleRequest, 
  BatchSaleResponse,
  ExpiryAlert,
  ExpiryDashboardStats 
} from '@/core/types/inventory.types';

// Query Keys para React Query
export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters: string) => [...batchKeys.lists(), { filters }] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
  alerts: () => [...batchKeys.all, 'alerts'] as const,
  stats: () => [...batchKeys.all, 'stats'] as const,
  byProduct: (productId: string) => [...batchKeys.all, 'product', productId] as const,
};

// Hook: Buscar todos os lotes com filtros
export const useBatches = (filters?: {
  product_id?: string;
  status?: string;
  expiring_soon?: boolean;
  supplier?: string;
}) => {
  return useQuery({
    queryKey: batchKeys.list(JSON.stringify(filters || {})),
    queryFn: async () => {
      let query = supabase
        .from('product_batches')
        .select(`
          *,
          products!inner(name, category, unit_type, package_units, has_package_tracking, has_unit_tracking)
        `)
        .order('expiry_date', { ascending: true });

      // Aplicar filtros
      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.supplier) {
        query = query.ilike('supplier_name', `%${filters.supplier}%`);
      }
      
      if (filters?.expiring_soon) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        query = query.lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar lotes:', error);
        throw new Error(`Erro ao buscar lotes: ${error.message}`);
      }

      // Calcular campos derivados
      const batchesWithCalculations: ProductBatch[] = data.map(batch => {
        const today = new Date();
        const expiryDate = new Date(batch.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...batch,
          days_until_expiry: daysUntilExpiry,
          is_expired: daysUntilExpiry < 0,
          is_expiring_soon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0,
          units_sold: batch.total_units - batch.available_units,
          sales_percentage: batch.total_units > 0 ? 
            ((batch.total_units - batch.available_units) / batch.total_units) * 100 : 0
        };
      });

      return batchesWithCalculations;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook: Buscar lote específico por ID
export const useBatch = (batchId: string) => {
  return useQuery({
    queryKey: batchKeys.detail(batchId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_batches')
        .select(`
          *,
          products!inner(name, category, unit_type, package_units),
          batch_units(*)
        `)
        .eq('id', batchId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar lote:', error);
        throw new Error(`Erro ao buscar lote: ${error.message}`);
      }

      // Calcular campos derivados
      const today = new Date();
      const expiryDate = new Date(data.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...data,
        days_until_expiry: daysUntilExpiry,
        is_expired: daysUntilExpiry < 0,
        is_expiring_soon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0,
        units_sold: data.total_units - data.available_units,
        sales_percentage: data.total_units > 0 ? 
          ((data.total_units - data.available_units) / data.total_units) * 100 : 0
      } as ProductBatch;
    },
    enabled: !!batchId,
  });
};

// Hook: Buscar lotes por produto
export const useBatchesByProduct = (productId: string) => {
  return useQuery({
    queryKey: batchKeys.byProduct(productId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_batches')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'active')
        .order('expiry_date', { ascending: true });
        
      if (error) {
        console.error('Erro ao buscar lotes do produto:', error);
        throw new Error(`Erro ao buscar lotes: ${error.message}`);
      }

      return data as ProductBatch[];
    },
    enabled: !!productId,
  });
};

// Hook: Criar novo lote
export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (batchData: BatchFormData) => {
      const { data, error } = await supabase.rpc('create_product_batch', {
        p_product_id: batchData.product_id,
        p_batch_code: batchData.batch_code,
        p_manufacturing_date: batchData.manufacturing_date,
        p_expiry_date: batchData.expiry_date,
        p_total_packages: batchData.total_packages,
        p_total_units: batchData.total_units,
        p_supplier_name: batchData.supplier_name,
        p_supplier_batch_code: batchData.supplier_batch_code,
        p_cost_per_unit: batchData.cost_per_unit,
        p_quality_grade: batchData.quality_grade,
        p_notes: batchData.notes,
        p_create_units: batchData.create_units
      });

      if (error) {
        console.error('Erro ao criar lote:', error);
        throw new Error(`Erro ao criar lote: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao criar lote');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Lote ${data.batch_code} criado com sucesso!`);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: batchKeys.byProduct(variables.product_id) });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Atualizar estoque do produto
    },
    onError: (error) => {
      console.error('Erro ao criar lote:', error);
      toast.error(`Erro ao criar lote: ${error.message}`);
    },
  });
};

// Hook: Venda com FEFO
export const useSellFromBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleData: BatchSaleRequest): Promise<BatchSaleResponse> => {
      const { data, error } = await supabase.rpc('sell_from_batch_fifo', {
        p_product_id: saleData.product_id,
        p_quantity: saleData.quantity,
        p_sale_id: saleData.sale_id,
        p_customer_id: saleData.customer_id,
        p_allow_partial: saleData.allow_partial,
        p_max_days_until_expiry: saleData.max_days_until_expiry
      });

      if (error) {
        console.error('Erro na venda FEFO:', error);
        throw new Error(`Erro na venda: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido na venda');
      }

      return data as BatchSaleResponse;
    },
    onSuccess: (data, variables) => {
      if (data.partial_sale) {
        toast.warning(`Venda parcial: ${data.units_sold}/${data.units_requested} unidades vendidas`);
      } else {
        toast.success(`Venda realizada: ${data.units_sold} unidades (FEFO aplicado)`);
      }
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: batchKeys.byProduct(variables.product_id) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
    onError: (error) => {
      console.error('Erro na venda FEFO:', error);
      toast.error(`Erro na venda: ${error.message}`);
    },
  });
};

// Hook: Buscar alertas de vencimento
export const useExpiryAlerts = (filters?: {
  status?: string;
  priority?: number;
  product_id?: string;
}) => {
  return useQuery({
    queryKey: [...batchKeys.alerts(), JSON.stringify(filters || {})],
    queryFn: async () => {
      let query = supabase
        .from('expiry_alerts')
        .select(`
          *,
          product_batches!inner(batch_code, expiry_date, available_units),
          products!inner(name, category)
        `)
        .order('priority', { ascending: false })
        .order('alert_date', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.priority) {
        query = query.gte('priority', filters.priority);
      }
      
      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar alertas:', error);
        throw new Error(`Erro ao buscar alertas: ${error.message}`);
      }

      return data as ExpiryAlert[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

// Hook: Estatísticas do dashboard de validade
export const useExpiryStats = () => {
  return useQuery({
    queryKey: batchKeys.stats(),
    queryFn: async () => {
      // Buscar estatísticas de lotes
      const { data: batchStats, error: batchError } = await supabase
        .from('product_batches')
        .select('status, available_units, cost_per_unit, expiry_date')
        .eq('status', 'active');

      if (batchError) {
        throw new Error(`Erro ao buscar estatísticas de lotes: ${batchError.message}`);
      }

      // Buscar estatísticas de alertas
      const { data: alertStats, error: alertError } = await supabase
        .from('expiry_alerts')
        .select('status, priority, estimated_loss_value')
        .eq('status', 'active');

      if (alertError) {
        throw new Error(`Erro ao buscar estatísticas de alertas: ${alertError.message}`);
      }

      // Calcular estatísticas
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const stats: ExpiryDashboardStats = {
        total_active_batches: batchStats.length,
        expired_batches: batchStats.filter(b => b.expiry_date < todayStr).length,
        expiring_today: batchStats.filter(b => b.expiry_date === todayStr).length,
        expiring_week: batchStats.filter(b => b.expiry_date <= weekFromNow && b.expiry_date >= todayStr).length,
        expiring_month: batchStats.filter(b => b.expiry_date <= monthFromNow && b.expiry_date >= todayStr).length,
        total_expired_value: batchStats
          .filter(b => b.expiry_date < todayStr)
          .reduce((sum, b) => sum + (b.available_units * (b.cost_per_unit || 0)), 0),
        active_alerts: alertStats.length,
        critical_alerts: alertStats.filter(a => a.priority >= 4).length,
        products_with_batches: new Set(batchStats.map(b => b.product_id)).size
      };

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook: Monitorar alertas (executar diariamente)
export const useMonitorAlerts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('monitor_expiry_alerts');

      if (error) {
        console.error('Erro no monitoramento:', error);
        throw new Error(`Erro no monitoramento: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(`Monitoramento executado: ${data.alerts_created} novos alertas`);
      
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Erro no monitoramento:', error);
      toast.error(`Erro no monitoramento: ${error.message}`);
    },
  });
};