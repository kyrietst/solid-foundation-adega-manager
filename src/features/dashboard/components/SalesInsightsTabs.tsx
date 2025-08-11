import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { TrendingUp, PieChart } from 'lucide-react';
import { TopProductsCard } from './TopProductsCard';
import { CategoryMixDonut } from './CategoryMixDonut';

interface SalesInsightsTabsProps {
  className?: string;
}

export function SalesInsightsTabs({ className }: SalesInsightsTabsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-400 font-medium">Insights de Vendas</CardTitle>
        </div>
        <Tabs defaultValue="top" className="mt-2">
          <TabsList>
            <TabsTrigger value="top" className="gap-1">
              <TrendingUp className="h-4 w-4" /> Top Produtos
            </TabsTrigger>
            <TabsTrigger value="mix" className="gap-1">
              <PieChart className="h-4 w-4" /> Mix por Categoria
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top">
          <TabsContent value="top" className="m-0">
            <div className="h-[300px]">
              <TopProductsCard />
            </div>
          </TabsContent>
          <TabsContent value="mix" className="m-0">
            <div className="h-[300px]">
              <CategoryMixDonut />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


