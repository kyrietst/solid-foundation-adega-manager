/**
 * VariantStockDisplay.tsx - Componente para exibir breakdown de estoque por variantes
 * Mostra unidades individuais e pacotes de forma clara e intuitiva
 */

import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Package, Wine, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import type { ProductWithVariants } from '@/core/types/variants.types';

interface VariantStockDisplayProps {
  product: ProductWithVariants;
  showPrices?: boolean;
  showConversionInfo?: boolean;
  compact?: boolean;
  className?: string;
}

export const VariantStockDisplay: React.FC<VariantStockDisplayProps> = ({
  product,
  showPrices = true,
  showConversionInfo = true,
  compact = false,
  className
}) => {
  const { unit_variant, package_variant, total_stock_units, can_sell_units, can_sell_packages } = product;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {unit_variant && (
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
            <Wine className="h-3 w-3 mr-1" />
            {unit_variant.stock_quantity} un
          </Badge>
        )}
        {package_variant && (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Package className="h-3 w-3 mr-1" />
            {package_variant.stock_quantity} fardos
          </Badge>
        )}
        <Badge variant="outline" className="text-primary-yellow border-primary-yellow/30">
          Total: {total_stock_units} un
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("bg-black/40 border-white/10", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-yellow" />
              Estoque por Variante
            </h4>
            <Badge variant="outline" className="text-primary-yellow border-primary-yellow/30">
              Total: {total_stock_units} unidades
            </Badge>
          </div>

          <div className="grid gap-3">
            {/* Variante de Unidade */}
            {unit_variant ? (
              <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wine className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Unidades Individuais</p>
                    <p className="text-sm text-gray-400">
                      {unit_variant.stock_quantity} disponíveis
                      {showPrices && ` • ${formatCurrency(unit_variant.price)} cada`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {can_sell_units ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                  )}
                  <Badge 
                    variant={can_sell_units ? "secondary" : "destructive"}
                    className={cn(
                      can_sell_units 
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    )}
                  >
                    {unit_variant.stock_quantity} un
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-500/5 border border-gray-500/20 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Wine className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-400">Unidades Individuais</p>
                    <p className="text-sm text-gray-500">Variante não configurada</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-gray-500 border-gray-500/30">
                  N/A
                </Badge>
              </div>
            )}

            {/* Variante de Pacote */}
            {package_variant ? (
              <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Pacotes/Fardos</p>
                    <p className="text-sm text-gray-400">
                      {package_variant.stock_quantity} fardos ({package_variant.units_in_package || 1} un cada)
                      {showPrices && ` • ${formatCurrency(package_variant.price)} por fardo`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {can_sell_packages ? (
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                  )}
                  <Badge 
                    variant={can_sell_packages ? "secondary" : "destructive"}
                    className={cn(
                      can_sell_packages 
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    )}
                  >
                    {package_variant.stock_quantity} fardos
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-500/5 border border-gray-500/20 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-400">Pacotes/Fardos</p>
                    <p className="text-sm text-gray-500">Variante não configurada</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-gray-500 border-gray-500/30">
                  N/A
                </Badge>
              </div>
            )}

            {/* Informação de Conversão */}
            {showConversionInfo && unit_variant && package_variant && (
              <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-orange-400" />
                  <p className="text-sm font-medium text-orange-400">Conversão Automática</p>
                </div>
                <p className="text-xs text-gray-400">
                  Quando unidades esgotarem, pacotes podem ser automaticamente convertidos. 
                  {package_variant.stock_quantity > 0 && (
                    <span className="text-orange-300">
                      {' '}+{package_variant.stock_quantity * (package_variant.units_in_package || 1)} unidades disponíveis via conversão.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Componente compacto para uso em listas
 */
export const VariantStockBadge: React.FC<{ product: ProductWithVariants; className?: string }> = ({ 
  product, 
  className 
}) => {
  const { unit_variant, package_variant, total_stock_units } = product;
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {unit_variant && unit_variant.stock_quantity > 0 && (
        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
          {unit_variant.stock_quantity} un
        </Badge>
      )}
      {package_variant && package_variant.stock_quantity > 0 && (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
          {package_variant.stock_quantity} fardos
        </Badge>
      )}
      {total_stock_units === 0 && (
        <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
          Esgotado
        </Badge>
      )}
    </div>
  );
};