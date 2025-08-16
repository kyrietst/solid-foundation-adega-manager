import React from 'react';
import { TopProductsCard } from './TopProductsCard';
import { CategoryMixDonut } from './CategoryMixDonut';

interface SalesInsightsTabsProps {
  className?: string;
}

export function SalesInsightsTabs({ className }: SalesInsightsTabsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TopProductsCard cardHeight={620} />
        </div>
        <div className="lg:col-span-6">
          <CategoryMixDonut className="h-[620px]" showTotal={false} />
        </div>
      </div>
    </div>
  );
}


