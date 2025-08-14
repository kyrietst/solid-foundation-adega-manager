/**
 * Grid de produtos puro
 * Sub-componente especializado para renderização de produtos
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  onAddToCart: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  gridColumns,
  onAddToCart,
  variant = 'default',
  glassEffect = true,
  className = '',
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

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
          <ProductCard 
            product={product} 
            onAddToCart={onAddToCart}
            variant={variant}
            glassEffect={glassEffect}
          />
        </div>
      ))}
    </div>
  );
};