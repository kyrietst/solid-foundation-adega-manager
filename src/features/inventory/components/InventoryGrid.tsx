/**
 * Grid específico para gestão de estoque
 * Usa InventoryCard ao invés de ProductCard (vendas)
 */

import React from 'react';
import type { Product, StoreLocation } from '@/types/inventory.types';
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
  onTransfer?: (product: Product) => void; // 🏪 v3.4.0 - Transferência entre lojas
  storeFilter?: StoreLocation; // 🏪 v3.4.0 - Qual loja está sendo exibida
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
  onTransfer, // 🏪 v3.4.0
  storeFilter, // 🏪 v3.4.0
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
            animationName: 'fadeInUp',
            animationDuration: '0.6s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${index * 50}ms`
          }}
        >
          <InventoryCard
            product={product}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onAdjustStock={onAdjustStock}
            onTransfer={onTransfer}
            storeFilter={storeFilter}
            variant={variant}
            glassEffect={glassEffect}
          />
        </div>
      ))}
    </div>
  );
};