/**
 * LoadingGrid - Skeleton para grids de dados
 * Mostra placeholders enquanto dados estão carregando
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { Skeleton } from '@/shared/ui/composite/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/primitives/card';

export interface LoadingGridProps {
  itemCount?: number;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'simple';
  className?: string;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
};

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  itemCount = 6,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  variant = 'card',
  className
}) => {
  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    gapClasses[gap],
    className
  );

  const renderSkeletonItem = (index: number) => {
    if (variant === 'card') {
      return (
        <Card key={index} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div key={index} className="animate-pulse space-y-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  };

  return (
    <div className={gridClasses}>
      {Array.from({ length: itemCount }).map((_, index) => 
        renderSkeletonItem(index)
      )}
    </div>
  );
};