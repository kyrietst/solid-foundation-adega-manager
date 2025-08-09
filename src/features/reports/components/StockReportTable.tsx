/**
 * Tabela detalhada do relatório de estoque por categoria - História 1.5
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { Badge } from '@/shared/ui/primitives/badge';
import { Progress } from '@/shared/ui/primitives/progress';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { StockReportByCategory } from '../types';
import { formatCurrency } from '@/core/config/utils';

interface StockReportTableProps {
  categories: StockReportByCategory[];
  isLoading?: boolean;
}

export const StockReportTable: React.FC<StockReportTableProps> = ({
  categories,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5" />
          Valor do Estoque por Categoria
        </CardTitle>
        <CardDescription className="text-adega-silver">
          Análise detalhada do valor do estoque distribuído por categoria de produtos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-adega-platinum">Categoria</TableHead>
              <TableHead className="text-adega-platinum">Produtos</TableHead>
              <TableHead className="text-adega-platinum">Unidades</TableHead>
              <TableHead className="text-adega-platinum">Valor Total</TableHead>
              <TableHead className="text-adega-platinum">Preço Médio</TableHead>
              <TableHead className="text-adega-platinum">% do Total</TableHead>
              <TableHead className="text-adega-platinum">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow 
                key={category.category}
                className="border-white/10 hover:bg-white/5"
              >
                <TableCell className="font-medium text-white">
                  {category.category}
                </TableCell>
                <TableCell className="text-adega-silver">
                  {category.total_products.toLocaleString()}
                </TableCell>
                <TableCell className="text-adega-silver">
                  {category.total_units.toLocaleString()}
                </TableCell>
                <TableCell className="text-white font-semibold">
                  {formatCurrency(category.total_value)}
                </TableCell>
                <TableCell className="text-adega-silver">
                  {formatCurrency(category.avg_price)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={category.percentage_of_total} 
                      className="w-12 h-2" 
                    />
                    <span className="text-xs text-adega-gold font-medium">
                      {category.percentage_of_total}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {category.low_stock_products > 0 ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {category.low_stock_products} baixo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-green-400">
                      OK
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-adega-silver">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de estoque encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};