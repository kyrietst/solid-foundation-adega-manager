/**
 * Grid de produtos puro
 * Sub-componente especializado para renderização de produtos
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  onAddToCart: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  gridColumns,
  onAddToCart,
}) => {
  return (
    <div className={`grid gap-4 grid-cols-${gridColumns.mobile} md:grid-cols-${gridColumns.tablet} lg:grid-cols-${gridColumns.desktop}`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};