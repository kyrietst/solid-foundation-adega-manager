/**
 * Componente de sumário do relatório de estoque - História 1.5
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { TrendingUp, Package, AlertTriangle, BarChart3 } from 'lucide-react';
import { StockReportSummary } from '../types';
import { formatCurrency } from '@/core/config/utils';

interface StockReportSummaryProps {
  summary: StockReportSummary;
  isLoading?: boolean;
}

export const StockReportSummaryCard: React.FC<StockReportSummaryProps> = ({
  summary,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Valor Total do Portfólio */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">
            Valor Total do Estoque
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-adega-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(summary.total_portfolio_value)}
          </div>
          <p className="text-xs text-adega-silver">
            Valor total do inventário
          </p>
        </CardContent>
      </Card>

      {/* Total de Produtos */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">
            Total de Produtos
          </CardTitle>
          <Package className="h-4 w-4 text-adega-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.total_products.toLocaleString()}
          </div>
          <p className="text-xs text-adega-silver">
            {summary.total_units.toLocaleString()} unidades em estoque
          </p>
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">
            Categorias Ativas
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-adega-purple" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.categories_count}
          </div>
          <p className="text-xs text-adega-silver">
            Diferentes categorias de produtos
          </p>
        </CardContent>
      </Card>

      {/* Alertas de Estoque Baixo */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">
            Estoque Baixo
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${summary.low_stock_alert_count > 0 ? 'text-red-400' : 'text-green-400'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.low_stock_alert_count}
          </div>
          <p className="text-xs text-adega-silver">
            {summary.low_stock_alert_count > 0 ? (
              <Badge variant="destructive" className="text-xs">Atenção necessária</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs text-green-400">Estoque OK</Badge>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};