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
      'grid gap-4 p-4 rounded-lg',
      `grid-cols-${gridColumns.mobile} md:grid-cols-${gridColumns.tablet} lg:grid-cols-${gridColumns.desktop}`,
      glassClasses,
      className
    )}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
          variant={variant}
          glassEffect={glassEffect}
        />
      ))}
    </div>
  );
};