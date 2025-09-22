import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

interface OutOfStockProduct {
  id: string;
  name: string;
  stock_packages: number;
  stock_units_loose: number;
  category?: string;
}

interface NotificationContextValue {
  outOfStockCount: number;
  outOfStockItems: OutOfStockProduct[];
}

const NotificationContext = createContext<NotificationContextValue>({
  outOfStockCount: 0,
  outOfStockItems: [],
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Ultra-simplificação: Apenas produtos sem estoque (stock = 0)
  const { data: outOfStockItems = [] } = useQuery({
    queryKey: ['notifications', 'out-of-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_packages, stock_units_loose, category')
        .eq('stock_packages', 0)
        .eq('stock_units_loose', 0);

      if (error) throw error;
      return data as OutOfStockProduct[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return (
    <NotificationContext.Provider
      value={{ outOfStockCount: outOfStockItems.length, outOfStockItems }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => useContext(NotificationContext);
