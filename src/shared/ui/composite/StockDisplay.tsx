/**
 * Componente de Exibição de Estoque Dinâmico
 * Implementa SPRINT 3 - Tarefa 3.1.2-3.1.4
 * Baseado na documentação docs/limpeza/prompt.md
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { useStockDisplay, getStockStatus, getStockStatusColor } from '@/shared/utils/stockCalculations';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/shared/ui/primitives/tooltip';
import { Info } from 'lucide-react';

interface StockDisplayProps {
  stock_quantity: number;
  units_per_package?: number;
  minimum_stock?: number;
  className?: string;
  showTooltip?: boolean;
  showStatus?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const StockDisplay: React.FC<StockDisplayProps> = ({
  stock_quantity,
  units_per_package,
  minimum_stock,
  className,
  showTooltip = true,
  showStatus = false,
  variant = 'default'
}) => {
  const stockDisplay = useStockDisplay(stock_quantity, units_per_package);
  const stockStatus = getStockStatus(stock_quantity, minimum_stock);
  const statusColor = getStockStatusColor(stockStatus);

  // Conteúdo do tooltip explicativo
  const tooltipContent = units_per_package ? (
    <div className="space-y-1">
      <p className="font-medium">Detalhes do Estoque:</p>
      <p>Total: {stock_quantity} unidades</p>
      <p>Pacotes completos: {stockDisplay.packages} ({units_per_package} un/pacote)</p>
      <p>Unidades soltas: {stockDisplay.units}</p>
      {minimum_stock && (
        <p className="text-yellow-200 mt-2">
          Estoque mínimo: {minimum_stock}
        </p>
      )}
      <div className="mt-2 pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-300">
          Cálculo automático: pacotes = {stock_quantity} ÷ {units_per_package}
        </p>
      </div>
    </div>
  ) : (
    <div className="space-y-1">
      <p>Total: {stock_quantity} unidades</p>
      {minimum_stock && (
        <p className="text-yellow-200">Estoque mínimo: {minimum_stock}</p>
      )}
    </div>
  );

  // Renderização baseada na variante
  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <span className={cn(statusColor, 'text-sm', className)}>
            {stockDisplay.formatted}
          </span>
        );

      case 'detailed':
        return (
          <div className={cn('space-y-1', className)}>
            <div className={cn(statusColor, 'font-medium')}>
              {stockDisplay.formatted}
            </div>
            {units_per_package && (
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>Total: {stock_quantity} unidades</div>
                <div>{stockDisplay.packages} pacotes × {units_per_package} + {stockDisplay.units}</div>
              </div>
            )}
            {showStatus && (
              <Badge
                variant={stockStatus === 'adequate' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {stockStatus === 'out_of_stock' ? 'Sem estoque' :
                 stockStatus === 'low_stock' ? 'Baixo' : 'OK'}
              </Badge>
            )}
          </div>
        );

      default:
        return (
          <div className={cn('inline-flex items-center gap-2', className)}>
            <span className={cn(statusColor, 'font-medium')}>
              {stockDisplay.formatted}
            </span>
            {showStatus && (
              <Badge
                variant={stockStatus === 'adequate' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {stockStatus === 'out_of_stock' ? 'Sem estoque' :
                 stockStatus === 'low_stock' ? 'Baixo' : 'OK'}
              </Badge>
            )}
          </div>
        );
    }
  };

  const content = renderContent();

  // Wrapper com tooltip se habilitado
  if (showTooltip && units_per_package) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 cursor-help">
              {content}
              <Info className="h-3 w-3 opacity-50 hover:opacity-100 transition-opacity" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Export para usar em outros componentes
export default StockDisplay;