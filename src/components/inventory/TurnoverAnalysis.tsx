import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Clock, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { TurnoverAnalysis as TurnoverAnalysisType, TurnoverRate } from '@/types/inventory.types';

interface TurnoverAnalysisProps {
  className?: string;
}

export const TurnoverAnalysis: React.FC<TurnoverAnalysisProps> = ({ className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90'>('30');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Query para produtos e vendas
  const { data: turnoverData = [], isLoading } = useQuery({
    queryKey: ['turnover-analysis', selectedPeriod, selectedCategory],
    queryFn: async (): Promise<TurnoverAnalysisType[]> => {
      // Buscar produtos
      let productsQuery = supabase
        .from('products')
        .select('*');

      if (selectedCategory !== 'all') {
        productsQuery = productsQuery.eq('category', selectedCategory);
      }

      const { data: products, error: productsError } = await productsQuery;
      if (productsError) throw productsError;

      // Buscar vendas dos últimos períodos
      const days30 = new Date();
      days30.setDate(days30.getDate() - 30);
      const days60 = new Date();
      days60.setDate(days60.getDate() - 60);
      const days90 = new Date();
      days90.setDate(days90.getDate() - 90);

      const { data: sales, error: salesError } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          sales!inner(created_at)
        `)
        .gte('sales.created_at', days90.toISOString());

      if (salesError) throw salesError;

      // Calcular análise de giro
      return products.map(product => {
        const productSales = sales.filter(sale => sale.product_id === product.id);
        
        const salesLast30Days = productSales
          .filter(sale => new Date(sale.sales.created_at) >= days30)
          .reduce((sum, sale) => sum + sale.quantity, 0);

        const salesLast60Days = productSales
          .filter(sale => new Date(sale.sales.created_at) >= days60)
          .reduce((sum, sale) => sum + sale.quantity, 0);

        const salesLast90Days = productSales
          .filter(sale => new Date(sale.sales.created_at) >= days90)
          .reduce((sum, sale) => sum + sale.quantity, 0);

        const lastSale = productSales
          .sort((a, b) => new Date(b.sales.created_at).getTime() - new Date(a.sales.created_at).getTime())[0];

        const daysSinceLastSale = lastSale 
          ? Math.floor((new Date().getTime() - new Date(lastSale.sales.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        // Calcular taxa de giro recomendada baseada nas vendas
        const avgSalesPerDay = salesLast30Days / 30;
        const recommendedTurnoverRate: TurnoverRate = 
          avgSalesPerDay >= 2 ? 'fast' :
          avgSalesPerDay >= 0.5 ? 'medium' : 'slow';

        // Determinar nível de estoque
        const stockRatio = product.stock_quantity / product.minimum_stock;
        const stockLevel: 'low' | 'adequate' | 'high' = 
          stockRatio <= 1 ? 'low' :
          stockRatio <= 3 ? 'adequate' : 'high';

        // Sugestão de reposição
        const reorderSuggestion = stockLevel === 'low' || 
          (product.turnover_rate === 'fast' && stockLevel === 'adequate');

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          lastSaleDate: lastSale?.sales.created_at,
          daysSinceLastSale,
          salesLast30Days,
          salesLast60Days,
          salesLast90Days,
          currentTurnoverRate: product.turnover_rate || 'medium',
          recommendedTurnoverRate,
          stockLevel,
          reorderSuggestion
        };
      }).sort((a, b) => {
        // Ordenar por prioridade: produtos que precisam de atenção primeiro
        if (a.reorderSuggestion && !b.reorderSuggestion) return -1;
        if (!a.reorderSuggestion && b.reorderSuggestion) return 1;
        return b.salesLast30Days - a.salesLast30Days;
      });
    },
  });

  // Query para categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      if (error) throw error;
      return [...new Set(data.map(p => p.category))].sort();
    },
  });

  const getTurnoverIcon = (rate: TurnoverRate) => {
    switch (rate) {
      case 'fast': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'slow': return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getStockIcon = (level: 'low' | 'adequate' | 'high') => {
    switch (level) {
      case 'low': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'adequate': return <Package className="h-4 w-4 text-yellow-600" />;
      case 'high': return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getRecommendationBadge = (analysis: TurnoverAnalysisType) => {
    if (analysis.currentTurnoverRate !== analysis.recommendedTurnoverRate) {
      return (
        <Badge variant="outline" className="border-orange-200 text-orange-700">
          Revisar: {analysis.recommendedTurnoverRate}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Adequado
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Analisando giro de produtos...</div>
        </CardContent>
      </Card>
    );
  }

  const criticalProducts = turnoverData.filter(p => p.reorderSuggestion);
  const needsReview = turnoverData.filter(p => p.currentTurnoverRate !== p.recommendedTurnoverRate);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controles */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Giro de Produtos
          </CardTitle>
          <CardDescription>
            Análise baseada em vendas dos últimos {selectedPeriod} dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div>
              <Select value={selectedPeriod} onValueChange={(value: '30' | '60' | '90') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-red-600 font-medium">Requer Atenção</div>
                  <div className="text-2xl font-bold text-red-700">{criticalProducts.length}</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 font-medium">Para Revisar</div>
                  <div className="text-2xl font-bold text-orange-700">{needsReview.length}</div>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-600 font-medium">Adequados</div>
                  <div className="text-2xl font-bold text-green-700">
                    {turnoverData.length - criticalProducts.length - needsReview.length}
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Análise Detalhada por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {turnoverData.map((analysis) => (
              <div
                key={analysis.productId}
                className={`p-4 rounded-lg border ${
                  analysis.reorderSuggestion 
                    ? 'border-red-200 bg-red-50' 
                    : analysis.currentTurnoverRate !== analysis.recommendedTurnoverRate
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{analysis.productName}</h4>
                      <Badge variant="outline">{analysis.category}</Badge>
                      {analysis.reorderSuggestion && (
                        <Badge variant="destructive">
                          Repor Estoque
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Vendas ({selectedPeriod}d)</div>
                        <div className="font-medium">
                          {selectedPeriod === '30' ? analysis.salesLast30Days :
                           selectedPeriod === '60' ? analysis.salesLast60Days :
                           analysis.salesLast90Days} unidades
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Giro Atual</div>
                        <div className="flex items-center gap-1">
                          {getTurnoverIcon(analysis.currentTurnoverRate)}
                          <span className="font-medium capitalize">{analysis.currentTurnoverRate}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Nível de Estoque</div>
                        <div className="flex items-center gap-1">
                          {getStockIcon(analysis.stockLevel)}
                          <span className="font-medium capitalize">{analysis.stockLevel}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Última Venda</div>
                        <div className="font-medium">
                          {analysis.daysSinceLastSale === 999 
                            ? 'Nunca' 
                            : `${analysis.daysSinceLastSale} dias`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {getRecommendationBadge(analysis)}
                  </div>
                </div>
                
                {analysis.reorderSuggestion && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Recomendação:</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      {analysis.stockLevel === 'low' 
                        ? 'Estoque baixo - considere fazer nova compra'
                        : 'Produto com giro alto e estoque moderado - monitore de perto'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};