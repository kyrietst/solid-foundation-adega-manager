/**
 * Hook para gerenciamento de notificações
 * Substitui o NotificationContext por uma abordagem mais direta
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface NotificationItem {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expired' | 'info';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  created_at: string;
  data?: any;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  minimum_stock: number;
  category: string;
  supplier?: string;
}

export const useNotifications = () => {
  // Query para produtos com estoque baixo
  const { data: lowStockProducts = [], isLoading: isLoadingLowStock } = useQuery({
    queryKey: ['notifications', 'low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, minimum_stock, category, supplier')
        .lt('stock_quantity', 'minimum_stock')
        .order('stock_quantity', { ascending: true });
      
      if (error) throw error;
      return data as LowStockProduct[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });

  // Query para produtos sem estoque
  const { data: outOfStockProducts = [], isLoading: isLoadingOutOfStock } = useQuery({
    queryKey: ['notifications', 'out-of-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, category, supplier')
        .eq('stock_quantity', 0)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  // Gerar notificações baseadas nos dados
  const notifications = useMemo((): NotificationItem[] => {
    const items: NotificationItem[] = [];

    // Notificações de estoque baixo
    lowStockProducts.forEach(product => {
      items.push({
        id: `low_stock_${product.id}`,
        type: 'low_stock',
        title: 'Estoque Baixo',
        message: `${product.name} - ${product.stock_quantity} restantes (mínimo: ${product.minimum_stock})`,
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString(),
        data: product
      });
    });

    // Notificações de produto sem estoque
    outOfStockProducts.forEach(product => {
      items.push({
        id: `out_of_stock_${product.id}`,
        type: 'out_of_stock',
        title: 'Produto Sem Estoque',
        message: `${product.name} está sem estoque`,
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString(),
        data: product
      });
    });

    // Notificações de produto sem estoque
    outOfStockProducts.forEach(product => {
      items.push({
        id: `out_of_stock_${product.id}`,
        type: 'out_of_stock',
        title: 'Produto Sem Estoque',
        message: `${product.name} está sem estoque`,
        priority: 'high',
        read: false,
        created_at: new Date().toISOString(),
        data: product
      });
    });

    // Ordenar por prioridade e data
    return items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [lowStockProducts, outOfStockProducts]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: {
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length,
    }
  }), [notifications, lowStockProducts, outOfStockProducts]);

  return {
    notifications,
    stats,
    lowStockProducts,
    outOfStockProducts,
    isLoading: isLoadingLowStock || isLoadingOutOfStock,
    
    // Helpers
    hasLowStock: lowStockProducts.length > 0,
    hasOutOfStock: outOfStockProducts.length > 0,
    hasNotifications: notifications.length > 0,
    
    // Legacy compatibility
    lowStockCount: lowStockProducts.length,
    lowStockItems: lowStockProducts,
  };
};

// Hook específico só para estoque baixo (para compatibilidade)
export const useLowStockNotifications = () => {
  const { lowStockProducts, lowStockCount, isLoading } = useNotifications();
  
  return {
    data: lowStockProducts,
    count: lowStockCount,
    isLoading,
  };
};