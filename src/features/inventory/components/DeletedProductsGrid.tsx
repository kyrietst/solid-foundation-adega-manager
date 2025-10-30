/**
 * DeletedProductsGrid - Grid para visualizar produtos deletados
 * Disponível apenas para administradores
 */

import React from 'react';
import { DeletedProductCard } from './DeletedProductCard';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { EmptySearchResults } from '@/shared/ui/composite/empty-state';
import { cn } from '@/core/config/utils';
import type { DeletedProduct } from '../hooks/useDeletedProducts';

interface DeletedProductsGridProps {
  products: DeletedProduct[];
  isLoading: boolean;
  onRestore: (product: DeletedProduct) => void;
  restoringProductId?: string | null;
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

export const DeletedProductsGrid: React.FC<DeletedProductsGridProps> = ({
  products,
  isLoading,
  onRestore,
  restoringProductId,
  gridColumns = { mobile: 1, tablet: 2, desktop: 3 },
  className = '',
}) => {
  if (isLoading) {
    return <LoadingScreen text="Carregando produtos deletados..." />;
  }

  if (products.length === 0) {
    return (
      <EmptySearchResults
        title="Nenhum produto deletado"
        description="Não há produtos deletados no momento. Todos os produtos estão ativos."
        icon="📦"
      />
    );
  }

  return (
    <div className={cn(
      'grid gap-6 p-6 pb-32 h-full overflow-y-auto',
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
          <DeletedProductCard
            product={product}
            onRestore={onRestore}
            isRestoring={restoringProductId === product.id}
          />
        </div>
      ))}
    </div>
  );
};

export default DeletedProductsGrid;
