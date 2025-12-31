/**
 * LowStockAlertCard - Card de alerta para produtos com estoque crítico
 *
 * Usa RPC get_low_stock_products para buscar produtos onde:
 * (stock_packages + stock_units_loose) <= minimum_stock
 *
 * @author Claude Code
 * @version 1.1.0
 * @date 2025-11-30
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, RefreshCw, ArrowRight, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { cn } from '@/core/config/utils';
import { useLowStockAlerts } from '@/features/dashboard/hooks/useDashboardMetrics';

interface LowStockAlertCardProps {
  className?: string;
  limit?: number;
}

export const LowStockAlertCard: React.FC<LowStockAlertCardProps> = ({
  className,
  limit = 5
}) => {
  const navigate = useNavigate();

  const { data: products, isLoading, error, refetch } = useLowStockAlerts(limit);

  const handleViewAll = () => {
    navigate('/inventory?tab=alerts');
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
      <div className={cn(
        "flex flex-col h-full bg-black/60 backdrop-blur-sm border border-red-500/40 rounded-xl shadow-lg p-4",
        className
      )}>
        <p className="text-red-400 text-sm">Erro ao carregar alertas de estoque</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-black/60 backdrop-blur-sm border rounded-xl shadow-lg transition-all duration-300",
        config.borderColor,
        className
      )}
    >
      <CardHeader className="pb-2 pt-4 px-4">
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

      <CardContent className="pt-0 px-4 pb-4 flex-1 overflow-auto">
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
            {products.map((product) => {
              // Determine which alerts to show
              const showPackageAlert = !product.is_legacy_override && product.limit_packages > 0 && product.stock_packages <= product.limit_packages;
              const showUnitAlert = !product.is_legacy_override && product.limit_units > 0 && product.stock_units_loose <= product.limit_units;
              const showLegacyAlert = product.is_legacy_override;

              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex flex-col gap-2 p-3 rounded-lg transition-colors",
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
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "h-8 w-8 rounded flex items-center justify-center shrink-0",
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
                  </div>

                  {/* Alert Badges */}
                  <div className="flex flex-wrap gap-2 pl-11">
                    {showLegacyAlert && (
                      <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Total: {product.current_stock} / {product.minimum_stock}</span>
                      </div>
                    )}

                    {showPackageAlert && (
                      <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20">
                        <Box className="h-3 w-3" />
                        <span>Cx: {product.stock_packages} / {product.limit_packages}</span>
                      </div>
                    )}

                    {showUnitAlert && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
                        <Package className="h-3 w-3" />
                        <span>Un: {product.stock_units_loose} / {product.limit_units}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Ver Todos - navega para aba Alertas no Inventário */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="w-full mt-2 text-gray-400 hover:text-white hover:bg-white/10"
              title="Ver todos os alertas"
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
    </div>
  );
};

export default LowStockAlertCard;
