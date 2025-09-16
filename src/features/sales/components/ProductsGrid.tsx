/**
 * ProductsGrid principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { ProductsGridContainer } from '../../inventory/components/ProductsGridContainer';

export interface ProductsGridProps {
  showSearch?: boolean;
  showFilters?: boolean;
  showHeader?: boolean;
  initialCategory?: string;
  onProductSelect?: (product: Product) => void;
  mode?: 'sales' | 'inventory';
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export function ProductsGrid(props: ProductsGridProps) {
  return <ProductsGridContainer {...props} />;
}
