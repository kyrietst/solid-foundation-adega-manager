/**
 * InventoryInsightCard - Card de Estoque Atual
 * Mostra fluxo visual: Custo → Potencial de Venda com margem
 *
 * @version 1.0.0 - Design Original
 */

import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { cn } from '@/core/config/utils';

export interface InventoryInsightCardProps {
  /** Capital investido (cost_price * stock) */
  totalCost: number;
  /** Receita potencial se todo estoque for vendido (price * stock) */
  potentialRevenue: number;
  /** Número total de produtos em estoque */
  productCount: number;
  /** Produtos sem estoque (stock = 0) - não usado neste design */
  outOfStockCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Click handler (navigate to /inventory) */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

export const InventoryInsightCard: React.FC<InventoryInsightCardProps> = ({
  totalCost,
  potentialRevenue,
  productCount,
  isLoading = false,
  onClick,
  className
}) => {
  // Calcular margem percentual
  const margemPercent = totalCost > 0
    ? ((potentialRevenue - totalCost) / totalCost) * 100
    : 0;

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Card
      className={cn(
        "border-white/10 bg-black/40 backdrop-blur-sm",
        "h-full transition-all duration-300",
        onClick && "cursor-pointer hover:bg-black/50 hover:border-white/20",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <CardContent className="p-4 h-full flex flex-col justify-center">
        {isLoading ? (
          // Loading skeleton
          <div className="flex flex-col gap-2 w-full animate-pulse">
            <div className="h-3 w-20 bg-gray-700/50 rounded" />
            <div className="h-6 w-full bg-gray-700/50 rounded" />
            <div className="h-3 w-32 bg-gray-700/50 rounded" />
          </div>
        ) : (
          <>
            {/* Header: Título */}
            <span className="text-xs font-medium text-purple-400 mb-2">
              Estoque Atual
            </span>

            {/* Main Row: Icon + Cost → Potential */}
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-400" />
              </div>

              {/* Values: Cost → Potential */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-bold text-white">
                  {formatCurrency(totalCost)}
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatCurrency(potentialRevenue)}
                </span>
              </div>
            </div>

            {/* Footer: Margin + Product Count */}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span className="text-emerald-400 font-medium">
                +{margemPercent.toFixed(0)}% margem
              </span>
              <span>•</span>
              <span>{productCount} produtos</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
