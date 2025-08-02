/**
 * Hook para cálculos e métricas de inventory
 * Extraído do InventoryNew.tsx para separar lógica de negócio
 */

import { useMemo } from 'react';
import { Product } from '@/types/inventory.types';
import { InventoryCalculations } from '@/components/inventory/types';

export const useInventoryCalculations = (products: Product[]): InventoryCalculations => {
  return useMemo(() => {
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);
    const totalValue = products.reduce((total, p) => total + (p.price * p.stock_quantity), 0);
    
    const turnoverStats = {
      fast: products.filter(p => p.turnover_rate === 'fast').length,
      medium: products.filter(p => p.turnover_rate === 'medium').length,
      slow: products.filter(p => p.turnover_rate === 'slow').length,
    };

    return {
      totalProducts: products.length,
      lowStockProducts,
      totalValue,
      turnoverStats,
    };
  }, [products]);
};