/**
 * InventoryInsightCard - Specialized dashboard card showing inventory cost vs potential revenue
 *
 * Part of Dashboard SSoT Refactoring (2025-11-18)
 * Shows capital efficiency: invested cost → potential revenue
 *
 * @see docs/07-changelog/DASHBOARD_SSOT_REFACTORING_2025-11-18.md
 */

import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { FormatDisplay } from '@/shared/ui/composite/FormatDisplay';
import { cn } from '@/core/config/utils';

export interface InventoryInsightCardProps {
  /** Capital investido (cost_price * stock) */
  totalCost: number;
  /** Receita potencial se todo estoque for vendido (price * stock) */
  potentialRevenue: number;
  /** Número total de produtos em estoque */
  productCount: number;
  /** Produtos sem estoque (stock = 0) */
  outOfStockCount: number;
  /** Loading state */
  isLoading?: boolean;
  /** Click handler (navigate to /inventory) */
  onClick?: () => void;
}

export const InventoryInsightCard: React.FC<InventoryInsightCardProps> = ({
  totalCost,
  potentialRevenue,
  productCount,
  outOfStockCount,
  isLoading = false,
  onClick
}) => {
  // Calculate margin percentage
  const marginPercent = totalCost > 0
    ? ((potentialRevenue - totalCost) / totalCost) * 100
    : 0;

  return (
    <Card
      className={cn(
        "border-white/20 bg-black/80 backdrop-blur-xl shadow-lg",
        "h-[120px] transition-all duration-200",
        onClick && "cursor-pointer hover:border-accent-purple/60 hover:transform hover:-translate-y-1"
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
      <CardContent className="p-6 h-full flex items-center">
        {isLoading ? (
          // Loading skeleton
          <div className="flex items-center gap-3 w-full animate-pulse">
            <div className="h-8 w-8 bg-gray-700 rounded" />
            <div className="flex-1">
              <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
              <div className="h-6 w-full bg-gray-700 rounded mb-1" />
              <div className="h-2 w-32 bg-gray-700 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            {/* Icon */}
            <Package className="h-8 w-8 text-accent-purple flex-shrink-0" aria-hidden="true" />

            <div className="flex-1 min-w-0">
              {/* Title */}
              <p className="text-xs font-medium text-gray-300 mb-1">
                Estoque Atual
              </p>

              {/* Main Value: Cost → Revenue */}
              <div
                className="text-2xl font-bold flex items-center gap-1 flex-wrap"
                role="region"
                aria-label={`Custo investido ${totalCost.toFixed(2)} reais, receita potencial ${potentialRevenue.toFixed(2)} reais, margem de ${marginPercent.toFixed(0)} porcento`}
              >
                <span className="text-gray-100">
                  <FormatDisplay
                    value={totalCost}
                    type="currency"
                    variant="inherit"
                  />
                </span>
                <span className="text-gray-500 text-lg" aria-hidden="true">→</span>
                <span className="text-accent-green">
                  <FormatDisplay
                    value={potentialRevenue}
                    type="currency"
                    variant="inherit"
                  />
                </span>
              </div>

              {/* Description: Margin + Product Count */}
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-accent-green font-medium">
                  +{marginPercent.toFixed(0)}% margem
                </span>
                <span aria-hidden="true">•</span>
                <span>{productCount} produto{productCount !== 1 ? 's' : ''}</span>
                {outOfStockCount > 0 && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span className="text-accent-red">
                      {outOfStockCount} sem estoque
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
