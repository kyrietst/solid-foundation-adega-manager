/**
 * ProductsGrid principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { ProductsGridContainer } from '../products/ProductsGridContainer';

export interface ProductsGridProps {
  showSearch?: boolean;
  showFilters?: boolean;
  initialCategory?: string;
  onProductSelect?: (product: Product) => void;
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

export function ProductsGrid(props: ProductsGridProps) {
  return <ProductsGridContainer {...props} />;
}
