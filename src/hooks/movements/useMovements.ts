/**
 * Hook para buscar dados de movimentações
 * Centraliza todas as queries relacionadas a movimentações
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryMovement } from '@/types/inventory.types';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
}

export interface Sale {
  id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
}

export const useMovements = () => {
  // Query principal - movimentações
  const {
    data: movements = [],
    isLoading: isLoadingMovements,
    error: movementsError
  } = useQuery({
    queryKey: ['inventory_movements'],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return {
    movements,
    isLoadingMovements,
    movementsError,
  };
};

export const useMovementSupportData = () => {
  // Query para produtos
  const {
    data: products = [],
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['products', 'movement'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Query para clientes
  const {
    data: customers = [],
    isLoading: isLoadingCustomers
  } = useQuery({
    queryKey: ['customers', 'minimal'],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from('customers')
        .select('id,name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Query para vendas (para devolução/fiado)
  const {
    data: salesList = [],
    isLoading: isLoadingSales
  } = useQuery({
    queryKey: ['sales', 'minimal'],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select('id,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Query para usuários (para exibir responsável)
  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['users', 'minimal'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,name');
      if (error) throw error;
      return data;
    }
  });

  return {
    products,
    customers,
    salesList,
    users,
    isLoadingProducts,
    isLoadingCustomers,
    isLoadingSales,
    isLoadingUsers,
    isLoading: isLoadingProducts || isLoadingCustomers || isLoadingSales || isLoadingUsers
  };
};