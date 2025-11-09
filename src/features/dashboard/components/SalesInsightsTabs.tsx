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
          <TopProductsCard cardHeight={620} period={30} useCurrentMonth={false} />
        </div>
        <div className="lg:col-span-6">
          <CategoryMixDonut className="h-[620px]" showTotal={false} period={30} />
        </div>
      </div>
    </div>
  );
}


