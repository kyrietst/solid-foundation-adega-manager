/**
 * Hook principal para operações CRUD de fornecedores
 * Segue padrão v2.0.0 do sistema com React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import type { Supplier, SupplierFormData, SupplierFilters } from '../types';

/**
 * Hook para buscar todos os fornecedores (com filtros opcionais)
 */
export const useSuppliers = (filters?: SupplierFilters) => {
  const { userRole } = useAuth();
  
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async (): Promise<Supplier[]> => {
      let query = supabase
        .from('suppliers')
        .select('*');
      
      // Admins veem todos, outros apenas ativos
      if (userRole !== 'admin') {
        query = query.eq('is_active', true);
      }
      
      // Aplicar filtros se fornecidos
      if (filters?.search) {
        query = query.ilike('company_name', `%${filters.search}%`);
      }
      
      if (filters?.products_supplied) {
        query = query.contains('products_supplied', [filters.products_supplied]);
      }
      
      if (filters?.payment_method) {
        query = query.contains('payment_methods', [filters.payment_method]);
      }
      
      if (filters?.min_order_value !== undefined) {
        query = query.lte('minimum_order_value', filters.min_order_value);
      }
      
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      query = query.order('company_name', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar fornecedores:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para buscar um fornecedor específico
 */
export const useSupplier = (supplierId?: string) => {
  return useQuery({
    queryKey: ['suppliers', supplierId],
    queryFn: async (): Promise<Supplier | null> => {
      if (!supplierId) return null;
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        throw error;
      }
      
      return data;
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para criar novo fornecedor
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (supplierData: SupplierFormData) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          ...supplierData,
          created_by: user.id
        }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um fornecedor com este nome');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fornecedor criado',
        description: `Fornecedor "${data.company_name}" criado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para atualizar fornecedor
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, data: supplierData }: { id: string; data: Partial<SupplierFormData> }) => {
      const updateData = {
        ...supplierData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um fornecedor com este nome');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fornecedor atualizado',
        description: `Fornecedor "${data.company_name}" atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para ativar/desativar fornecedor
 */
export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: data.is_active ? 'Fornecedor ativado' : 'Fornecedor desativado',
        description: `Fornecedor "${data.company_name}" ${data.is_active ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para deletar fornecedor
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (supplierId: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fornecedor removido',
        description: 'Fornecedor removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para buscar estatísticas de fornecedores
 */
export const useSuppliersStats = () => {
  return useQuery({
    queryKey: ['suppliers-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, is_active, products_supplied, delivery_time');
      
      if (error) throw error;
      
      const total_suppliers = data?.length || 0;
      const active_suppliers = data?.filter(s => s.is_active).length || 0;
      
      // Calcular estatísticas agregadas
      const productCategoriesSet = new Set();
      data?.forEach(supplier => {
        supplier.products_supplied?.forEach(product => {
          productCategoriesSet.add(product);
        });
      });
      
      return {
        total_suppliers,
        active_suppliers,
        total_product_categories: productCategoriesSet.size,
        avg_delivery_time: 0, // TODO: Implementar cálculo real quando tiver dados
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};