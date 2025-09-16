/**
 * useMovementSupportData.ts - Hook para Dados de Apoio (Context7 Pattern)
 * Extraído do useMovements original (695 linhas)
 * Responsabilidade: Queries para dados relacionados e mock data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { Product, Customer, Sale, UserProfile } from '@/core/types/database';

// Mock data para produtos - catálogo completo expandido
const mockProducts: Product[] = [
  { id: 'prod_1', name: 'Vinho Tinto Cabernet Sauvignon Nacional', price: 35.90 },
  { id: 'prod_2', name: 'Vinho Branco Chardonnay Reserva', price: 42.50 },
  { id: 'prod_3', name: 'Vinho Rosé Pinot Noir Premium', price: 38.00 },
  { id: 'prod_4', name: 'Champagne Especial Safra 2020', price: 120.00 },
  { id: 'prod_5', name: 'Vinho Tinto Merlot Clássico', price: 28.00 },
  { id: 'prod_6', name: 'Vinho Branco Sauvignon Blanc', price: 55.75 },
  { id: 'prod_7', name: 'Vinho Tinto Malbec Argentino', price: 95.00 },
  { id: 'prod_8', name: 'Espumante Brut Especial', price: 120.00 },
  { id: 'prod_9', name: 'Vinho Tinto Bordeaux França', price: 180.00 },
  { id: 'prod_10', name: 'Vinho Branco Riesling Alemão', price: 75.50 },
  { id: 'prod_11', name: 'Vinho Tinto Tempranillo Reserva', price: 65.25 },
  { id: 'prod_12', name: 'Champagne Dom Pérignon Vintage', price: 150.00 },
  { id: 'prod_13', name: 'Vinho Tinto Sangiovese Italiano', price: 22.80 },
  { id: 'prod_14', name: 'Vinho Verde Português', price: 48.90 },
  { id: 'prod_15', name: 'Vinho Tinto Carmenère Chileno', price: 32.50 },
  { id: 'prod_16', name: 'Vinho Branco Moscato d\'Asti', price: 18.75 },
  { id: 'prod_17', name: 'Vinho Tinto Shiraz Australiano', price: 42.00 },
  { id: 'prod_18', name: 'Vinho Tinto Barolo Italiano Premium', price: 78.90 },
  { id: 'prod_19', name: 'Vinho Branco Albariño Espanhol', price: 25.80 },
  { id: 'prod_20', name: 'Vinho Tinto Amarone Safra Limitada', price: 220.00 },
  { id: 'prod_21', name: 'Vinho Rosé Provence França', price: 52.40 }
];

// Mock data para clientes expandido
const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'João Silva' },
  { id: 'cust_2', name: 'Maria Santos' },
  { id: 'cust_3', name: 'Pedro Oliveira' },
  { id: 'cust_4', name: 'Restaurante Bella Vista' },
  { id: 'cust_5', name: 'Tech Solutions Ltda' },
  { id: 'cust_6', name: 'Hotel Luxo Palace' },
  { id: 'cust_7', name: 'Casal Fernandes' },
  { id: 'cust_8', name: 'Martins & Associados Advocacia' },
  { id: 'cust_9', name: 'Clube Social Elite' },
  { id: 'cust_10', name: 'Empresa Nacional Seguros' },
  { id: 'cust_11', name: 'Roberto Silva' },
  { id: 'cust_12', name: 'Restaurante Três Estrelas' },
  { id: 'cust_13', name: 'Distribuidora Sul Vinhos' }
];

// Mock data para vendas expandido
const mockSales: Sale[] = [
  { id: 'sale_065', created_at: '2025-07-22T14:00:00Z' },
  { id: 'sale_070', created_at: '2025-07-25T12:00:00Z' },
  { id: 'sale_075', created_at: '2025-07-26T14:30:00Z' },
  { id: 'sale_080', created_at: '2025-07-28T19:00:00Z' },
  { id: 'sale_085', created_at: '2025-07-30T17:00:00Z' },
  { id: 'sale_090', created_at: '2025-08-01T14:00:00Z' },
  { id: 'sale_095', created_at: '2025-08-02T16:30:00Z' },
  { id: 'sale_100', created_at: '2025-08-04T13:00:00Z' },
  { id: 'sale_102', created_at: '2025-08-05T11:00:00Z' },
  { id: 'sale_105', created_at: '2025-08-06T19:00:00Z' },
  { id: 'sale_108', created_at: '2025-08-08T12:30:00Z' },
  { id: 'sale_112', created_at: '2025-08-10T16:00:00Z' },
  { id: 'sale_115', created_at: '2025-08-11T13:00:00Z' },
  { id: 'sale_119', created_at: '2025-08-12T15:00:00Z' },
  { id: 'sale_120', created_at: '2025-08-14T14:00:00Z' },
  { id: 'sale_123', created_at: '2025-08-15T09:00:00Z' }
];

// Mock data para usuários
const mockUsers: UserProfile[] = [
  { id: 'user_1', name: 'Admin Principal' },
  { id: 'user_2', name: 'Funcionário José' },
  { id: 'user_3', name: 'Supervisora Ana' }
];

/**
 * Hook para dados de apoio das movimentações
 * Context7 Pattern: Queries especializadas para selects e forms
 */
export const useMovementSupportData = () => {
  // Query real para produtos (fallback para mock em caso de erro)
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products_for_movements'],
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price')
          .order('name');

        if (error) throw error;
        return data || mockProducts;
      } catch (error) {
        console.warn('Usando mock data para produtos:', error);
        return mockProducts;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Query real para clientes (fallback para mock)
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError
  } = useQuery({
    queryKey: ['customers_for_movements'],
    queryFn: async (): Promise<Customer[]> => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name')
          .order('name');

        if (error) throw error;
        return data || mockCustomers;
      } catch (error) {
        console.warn('Usando mock data para clientes:', error);
        return mockCustomers;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Query real para vendas (fallback para mock)
  const {
    data: sales = [],
    isLoading: isLoadingSales,
    error: salesError
  } = useQuery({
    queryKey: ['sales_for_movements'],
    queryFn: async (): Promise<Sale[]> => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return data || mockSales;
      } catch (error) {
        console.warn('Usando mock data para vendas:', error);
        return mockSales;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query real para usuários (fallback para mock)
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users_for_movements'],
    queryFn: async (): Promise<UserProfile[]> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .order('name');

        if (error) throw error;
        return data || mockUsers;
      } catch (error) {
        console.warn('Usando mock data para usuários:', error);
        return mockUsers;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Estado de loading combinado
  const isLoadingSupportData = isLoadingProducts || isLoadingCustomers || isLoadingSales || isLoadingUsers;

  return {
    // Dados
    products,
    customers,
    sales,
    users,

    // Estados de loading individuais
    isLoadingProducts,
    isLoadingCustomers,
    isLoadingSales,
    isLoadingUsers,
    isLoadingSupportData,

    // Erros individuais
    productsError,
    customersError,
    salesError,
    usersError,

    // Mock data (para desenvolvimento)
    mockProducts,
    mockCustomers,
    mockSales,
    mockUsers,
  };
};

export default useMovementSupportData;