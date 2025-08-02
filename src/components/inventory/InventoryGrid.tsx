/**
 * Componente de visualização em grid dos produtos
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { ProductCard } from './ProductCard';
import { EmptyProducts } from '@/components/ui/empty-state';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { InventoryGridProps } from './types';

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  canDeleteProduct,
  isLoading = false,
}) => {
  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          canDelete={canDeleteProduct}
        />
      ))}
    </div>
  );
};