/**
 * Grid específico para gestão de estoque
 * Usa InventoryCard ao invés de ProductCard (vendas)
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { cn } from '@/core/config/utils';
import { InventoryCard } from './InventoryCard';

interface InventoryGridProps {
  products: Product[];
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  products,
  gridColumns,
  onViewDetails,
  onEdit,
  onAdjustStock,
  variant = 'default',
  glassEffect = true,
  className = '',
}) => {
  return (
    <div className={cn(
      'grid gap-6 p-6 h-full overflow-y-auto',
      `grid-cols-${gridColumns.mobile} md:grid-cols-${gridColumns.tablet} lg:grid-cols-${gridColumns.desktop} xl:grid-cols-${Math.min(gridColumns.desktop + 1, 6)}`,
      'transition-all duration-300 auto-rows-max',
      className
    )}>
      {products.map((product, index) => (
        <div
          key={product.id}
          className="transform transition-all duration-300"
          style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <InventoryCard 
            product={product} 
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onAdjustStock={onAdjustStock}
            variant={variant}
            glassEffect={glassEffect}
          />
        </div>
      ))}
    </div>
  );
};