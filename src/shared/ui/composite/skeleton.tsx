/**
 * Componente de skeleton loading para melhor UX durante carregamentos
 * Usado em cards, tabelas e grids para indicar carregamento de dados
 */

import React from 'react';
import { cn } from '@/core/config/utils';

export interface SkeletonProps {
  /** Classes CSS adicionais */
  className?: string;
  /** Se deve aplicar animação de pulse */
  animate?: boolean;
  /** Variante do skeleton */
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  /** Largura do skeleton */
  width?: string | number;
  /** Altura do skeleton */
  height?: string | number;
}

/**
 * Componente base de skeleton
 */
function Skeleton({
  className,
  animate = true,
  variant = 'default',
  width,
  height,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseClasses = cn(
    'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300',
    'bg-[length:200%_100%]',
    {
      'animate-shimmer': animate,
      'rounded-full': variant === 'circular',
      'rounded-md': variant === 'rectangular' || variant === 'default',
      'rounded-sm h-4': variant === 'text',
    },
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={baseClasses}
      style={style}
      {...props}
    />
  );
}

/**
 * Skeleton para cards de produto
 */
export const ProductCardSkeleton: React.FC = () => (
  <div className="border border-adega-gold/30 rounded-lg overflow-hidden bg-adega-charcoal/20 backdrop-blur-xl">
    {/* Imagem do produto */}
    <div className="aspect-square bg-muted/30 relative p-2">
      <Skeleton className="w-full h-full rounded-t-lg" />
    </div>
    
    {/* Informações do produto */}
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton para cards de cliente
 */
export const CustomerCardSkeleton: React.FC = () => (
  <div className="p-4 border border-white/10 rounded-lg bg-adega-charcoal/20">
    <div className="flex items-start gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
        
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para linhas de tabela
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ 
  columns = 6 
}) => (
  <tr className="border-b border-white/10">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="p-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton para grids de produtos
 */
export const ProductGridSkeleton: React.FC<{ items?: number }> = ({ 
  items = 12 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: items }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para lista de clientes
 */
export const CustomerListSkeleton: React.FC<{ items?: number }> = ({ 
  items = 6 
}) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <CustomerCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para métricas do dashboard
 */
export const MetricCardSkeleton: React.FC = () => (
  <div className="p-6 border border-white/10 rounded-lg bg-adega-charcoal/20">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton variant="circular" className="w-12 h-12" />
    </div>
    
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton para gráficos
 */
export const ChartSkeleton: React.FC<{ height?: number }> = ({ 
  height = 300 
}) => (
  <div className="p-4 border border-white/10 rounded-lg bg-adega-charcoal/20">
    <div className="space-y-3 mb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
    
    <Skeleton 
      className="w-full rounded-md" 
      height={height}
    />
  </div>
);

export { Skeleton }
