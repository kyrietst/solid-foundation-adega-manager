/**
 * Grid de produtos com VIRTUALIZAÇÃO
 * PERFORMANCE OPTIMIZED: Renderiza apenas itens visíveis (96% menos DOM nodes)
 * 
 * ⚡ Antes: 500 produtos = 500 cards renderizados
 * ⚡ Depois: 500 produtos = 12-18 cards renderizados
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Product } from '@/types/inventory.types';
import { cn } from '@/core/config/utils';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  onAddToCart: (product: Product) => void;
  onOpenSelection?: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  gridColumns,
  onAddToCart,
  onOpenSelection,
  variant = 'default',
  glassEffect = false,  // PERFORMANCE: Desabilitado por padrão em listas longas
  className = '',
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // PERFORMANCE: Calcular items por row baseado no gridColumns.desktop
  const ITEMS_PER_ROW = gridColumns.desktop || 3;

  // Agrupar produtos em rows para virtualização
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += ITEMS_PER_ROW) {
    rows.push(products.slice(i, i + ITEMS_PER_ROW));
  }

  // VIRTUALIZAÇÃO: Renderizar apenas rows visíveis
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,  // Card height (~450px) + pb-6 spacing (24px) + buffer (26px)
    overscan: 2,  // Renderizar 2 rows extras acima/abaixo para smooth scroll
  });

  return (
    <div
      ref={parentRef}
      className={cn(
        'h-full overflow-y-auto p-6 pb-32',
        className
      )}
    >
      {/* Container virtual com altura total */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* APENAS rows visíveis são renderizadas */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowProducts = rows[virtualRow.index];

          return (
            <div
              key={virtualRow.index}
              className={cn(
                'grid gap-6 absolute top-0 left-0 w-full pb-6',
                `grid-cols-${gridColumns.mobile} md:grid-cols-${gridColumns.tablet} lg:grid-cols-${gridColumns.desktop}`
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenSelection={onOpenSelection}
                  variant={variant}
                  glassEffect={glassEffect}  // Passar prop para controle fino
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};