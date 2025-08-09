import React from 'react';
import { cn } from '@/core/config/utils';

export interface BentoGridProps {
  className?: string;
  children: React.ReactNode;
  columns?: 4 | 6 | 8; // logical hint, we map to tailwind
}

/**
 * BentoGrid – responsive grid with auto-rows for masonry-like cards.
 * Default: 6 columns on lg, 4 on md, 1 on mobile. Auto rows allow row-span utilities.
 */
export function BentoGrid({ className, children, columns = 6 }: BentoGridProps) {
  return (
    <div
      className={cn(
        // auto rows so row-span works nicely
        'grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-[160px] gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BentoItemProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * BentoItem – wrapper that applies consistent glass container spacing.
 * Use Tailwind span utilities (e.g., col-span-2, row-span-3) via className to shape the layout.
 */
export function BentoItem({ className, children }: BentoItemProps) {
  return (
    <div className={cn('min-h-[160px] rounded-2xl', className)}>
      {children}
    </div>
  );
}

