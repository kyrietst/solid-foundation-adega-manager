/* eslint-disable react-hooks/exhaustive-deps */
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
  data?: Record<string, unknown>;
}

export interface OutOfStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  category: string;
  supplier?: string;
}

export const useNotifications = () => {
  // Query para produtos sem estoque (ultra-simplificado)
  const { data: outOfStockProducts = [], isLoading: isLoadingOutOfStock } = useQuery({
    queryKey: ['notifications', 'out-of-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, category, supplier')
        .eq('stock_quantity', 0);

      if (error) throw error;

      return (data ?? []) as OutOfStockProduct[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });

  // Gerar notificações ultra-simplificadas
  const notifications = useMemo((): NotificationItem[] => {
    const items: NotificationItem[] = [];

    // Apenas notificações de produtos sem estoque
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
  }), [notifications, outOfStockProducts]);

  return {
    notifications,
    stats,
    outOfStockProducts,
    isLoading: isLoadingOutOfStock,

    // Helpers ultra-simplificados
    hasOutOfStock: outOfStockProducts.length > 0,
    hasNotifications: notifications.length > 0,
  };
};