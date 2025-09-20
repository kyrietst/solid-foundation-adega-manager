/**
 * Componente de Exibição de Estoque Ultra-Simplificado
 * Mostra apenas números diretos sem classificações ou alertas
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { getStockStatus, getStockStatusColor } from '@/shared/utils/stockCalculations';

interface StockDisplayProps {
  stock_quantity: number;
  className?: string;
  showStatus?: boolean;
}

export const StockDisplay: React.FC<StockDisplayProps> = ({
  stock_quantity,
  className,
  showStatus = false
}) => {
  const stockStatus = getStockStatus(stock_quantity);
  const statusColor = getStockStatusColor(stockStatus);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn(statusColor, 'font-medium')}>
        {stock_quantity} unidades
      </span>
      {showStatus && stock_quantity === 0 && (
        <span className="text-xs text-red-600">Sem estoque</span>
      )}
    </div>
  );
};

// Export para usar em outros componentes
export default StockDisplay;