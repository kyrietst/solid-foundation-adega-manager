/**
 * LowStockAlertCard - Card de alerta para produtos com estoque crítico
 *
 * Usa RPC get_low_stock_products para buscar produtos onde:
 * (stock_packages + stock_units_loose) <= minimum_stock
 *
 * @author Claude Code
 * @version 1.0.0
 * @date 2025-11-21
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { supabase } from '@/core/api/supabase/client';
import { cn } from '@/core/config/utils';

interface LowStockProduct {
  id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  stock_packages: number;
  stock_units_loose: number;
  price: number;
  category: string;
}

interface LowStockAlertCardProps {
  className?: string;
  limit?: number;
}

export const LowStockAlertCard: React.FC<LowStockAlertCardProps> = ({
  className,
  limit = 5
}) => {
  const navigate = useNavigate();

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: async (): Promise<LowStockProduct[]> => {

      const { data, error } = await supabase
        .rpc('get_low_stock_products', { p_limit: limit });

      if (error) {
        console.error('❌ Erro ao buscar produtos com estoque baixo:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refresh a cada 5 minutos
    refetchOnWindowFocus: true,
  });

  const handleViewAll = () => {
    navigate('/inventory?filter=low-stock');
  };

  const handleRefresh = () => {
    refetch();
  };

  // Determinar severidade do alerta
  const getSeverity = () => {
    if (!products || products.length === 0) return 'ok';
    if (products.some(p => p.current_stock === 0)) return 'critical';
    return 'warning';
  };

  const severity = getSeverity();

  const severityConfig = {
    ok: {
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/5',
      iconColor: 'text-green-400',
      title: 'Estoque OK',
    },
    warning: {
      borderColor: 'border-yellow-500/50',
      bgColor: 'bg-yellow-500/5',
      iconColor: 'text-yellow-400',
      title: 'Estoque Baixo',
    },
    critical: {
      borderColor: 'border-red-500/50',
      bgColor: 'bg-red-500/5',
      iconColor: 'text-red-400',
      title: 'Estoque Crítico',
    },
  };

  const config = severityConfig[severity];

  if (error) {
    return (
      <Card className={cn("border-red-500/40 bg-black/80 backdrop-blur-xl", className)}>
        <CardContent className="p-4">
          <p className="text-red-400 text-sm">Erro ao carregar alertas de estoque</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-black/80 backdrop-blur-xl shadow-lg transition-all duration-300",
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-base font-semibold flex items-center gap-2", config.iconColor)}>
            <AlertTriangle className="h-5 w-5" />
            {config.title}
            {products && products.length > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "ml-2 text-xs",
                  severity === 'critical'
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                )}
              >
                {products.length} item{products.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            title="Atualizar"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-700 rounded" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
                  <div className="h-2 w-16 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  "hover:bg-white/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                  product.current_stock === 0
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-yellow-500/5"
                )}
                onClick={() => navigate(`/inventory?product=${product.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/inventory?product=${product.id}`);
                  }
                }}
              >
                {/* Icon */}
                <div className={cn(
                  "h-8 w-8 rounded flex items-center justify-center",
                  product.current_stock === 0
                    ? "bg-red-500/20"
                    : "bg-yellow-500/20"
                )}>
                  <Package className={cn(
                    "h-4 w-4",
                    product.current_stock === 0 ? "text-red-400" : "text-yellow-400"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.category}
                  </p>
                </div>

                {/* Stock */}
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    product.current_stock === 0
                      ? "text-red-400"
                      : "text-yellow-400"
                  )}>
                    {product.current_stock}
                  </p>
                  <p className="text-xs text-gray-500">
                    / {product.minimum_stock}
                  </p>
                </div>
              </div>
            ))}

            {/* Ver Todos */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="w-full mt-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Package className="h-8 w-8 text-green-400 mb-2" />
            <p className="text-sm text-gray-400">Nenhum produto com estoque crítico</p>
            <p className="text-xs text-gray-500">Todos os produtos estão acima do limite mínimo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlertCard;
