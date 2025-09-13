/**
 * StockConversionPreview.tsx - Componente para mostrar preview de conversões de estoque
 * Exibe o impacto de ajustes de estoque em ambas as variantes
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { ArrowRight, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import type { ProductWithVariants, VariantType } from '@/core/types/variants.types';

interface StockConversionPreviewProps {
  product: ProductWithVariants;
  selectedVariant: VariantType;
  adjustmentType: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  showFinancialImpact?: boolean;
  className?: string;
}

interface StockCalculation {
  current: {
    units: number;
    packages: number;
    totalUnits: number;
  };
  after: {
    units: number;
    packages: number;
    totalUnits: number;
  };
  conversion?: {
    packagesConverted: number;
    unitsFromConversion: number;
  };
  financialImpact?: {
    costChange: number;
    valueChange: number;
  };
}

export const StockConversionPreview: React.FC<StockConversionPreviewProps> = ({
  product,
  selectedVariant,
  adjustmentType,
  quantity,
  showFinancialImpact = true,
  className
}) => {
  const { unit_variant, package_variant } = product;

  // Calcular o estado atual e futuro do estoque
  const calculation = React.useMemo((): StockCalculation => {
    const current = {
      units: unit_variant?.stock_quantity || 0,
      packages: package_variant?.stock_quantity || 0,
      totalUnits: product.total_stock_units
    };

    let after = { ...current };
    let conversion: StockCalculation['conversion'];
    let financialImpact: StockCalculation['financialImpact'];

    // Aplicar o ajuste baseado no tipo e variante
    if (selectedVariant === 'unit') {
      switch (adjustmentType) {
        case 'entrada':
          after.units += quantity;
          break;
        case 'saida':
          // Se não temos unidades suficientes mas temos pacotes, simular conversão
          if (quantity > current.units && package_variant && current.packages > 0) {
            const unitsNeeded = quantity - current.units;
            const packagesNeeded = Math.ceil(unitsNeeded / (package_variant.units_in_package || 1));
            const packagesToConvert = Math.min(packagesNeeded, current.packages);
            const unitsFromConversion = packagesToConvert * (package_variant.units_in_package || 1);
            
            conversion = {
              packagesConverted: packagesToConvert,
              unitsFromConversion
            };
            
            after.packages -= packagesToConvert;
            after.units = current.units + unitsFromConversion - quantity;
          } else {
            after.units = Math.max(0, current.units - quantity);
          }
          break;
        case 'ajuste':
          after.units = quantity;
          break;
      }
    } else if (selectedVariant === 'package') {
      switch (adjustmentType) {
        case 'entrada':
          after.packages += quantity;
          break;
        case 'saida':
          after.packages = Math.max(0, current.packages - quantity);
          break;
        case 'ajuste':
          after.packages = quantity;
          break;
      }
    }

    // Recalcular total de unidades
    after.totalUnits = after.units + (after.packages * (package_variant?.units_in_package || 1));

    // Calcular impacto financeiro se solicitado
    if (showFinancialImpact) {
      const unitPrice = unit_variant?.cost_price || unit_variant?.price || 0;
      const packagePrice = package_variant?.cost_price || package_variant?.price || 0;
      
      const currentValue = (current.units * unitPrice) + (current.packages * packagePrice);
      const afterValue = (after.units * unitPrice) + (after.packages * packagePrice);
      
      financialImpact = {
        costChange: afterValue - currentValue,
        valueChange: ((after.units * (unit_variant?.price || 0)) + (after.packages * (package_variant?.price || 0))) - 
                    ((current.units * (unit_variant?.price || 0)) + (current.packages * (package_variant?.price || 0)))
      };
    }

    return { current, after, conversion, financialImpact };
  }, [product, selectedVariant, adjustmentType, quantity, showFinancialImpact]);

  const hasChanges = calculation.after.totalUnits !== calculation.current.totalUnits;
  const needsConversion = !!calculation.conversion;

  if (!hasChanges && quantity > 0) {
    return (
      <Card className={cn("bg-gray-500/5 border-gray-500/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">Nenhuma alteração será feita no estoque</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-black/40 border-white/10", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              Preview do Ajuste
            </h4>
            <Badge variant="outline" className="text-primary-yellow border-primary-yellow/30">
              {adjustmentType === 'entrada' ? 'Entrada' : adjustmentType === 'saida' ? 'Saída' : 'Correção'}
            </Badge>
          </div>

          {/* Comparação de estoque */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Estado atual */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase">Atual</p>
              <div className="space-y-1">
                {unit_variant && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Unidades:</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      {calculation.current.units}
                    </Badge>
                  </div>
                )}
                {package_variant && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Fardos:</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      {calculation.current.packages}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-gray-600/20">
                  <span className="text-sm font-medium text-white">Total:</span>
                  <Badge variant="outline" className="text-gray-300 border-gray-500/30 text-xs">
                    {calculation.current.totalUnits} un
                  </Badge>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-primary-yellow" />
            </div>

            {/* Estado futuro */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase">Após Ajuste</p>
              <div className="space-y-1">
                {unit_variant && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Unidades:</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        calculation.after.units !== calculation.current.units
                          ? "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/30"
                          : "bg-green-500/20 text-green-300 border-green-500/30",
                        "text-xs"
                      )}
                    >
                      {calculation.after.units}
                      {calculation.after.units !== calculation.current.units && (
                        <span className="ml-1">
                          {calculation.after.units > calculation.current.units ? (
                            <TrendingUp className="h-3 w-3 inline" />
                          ) : (
                            <TrendingDown className="h-3 w-3 inline" />
                          )}
                        </span>
                      )}
                    </Badge>
                  </div>
                )}
                {package_variant && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Fardos:</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        calculation.after.packages !== calculation.current.packages
                          ? "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30",
                        "text-xs"
                      )}
                    >
                      {calculation.after.packages}
                      {calculation.after.packages !== calculation.current.packages && (
                        <span className="ml-1">
                          {calculation.after.packages > calculation.current.packages ? (
                            <TrendingUp className="h-3 w-3 inline" />
                          ) : (
                            <TrendingDown className="h-3 w-3 inline" />
                          )}
                        </span>
                      )}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-gray-600/20">
                  <span className="text-sm font-medium text-white">Total:</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      calculation.after.totalUnits !== calculation.current.totalUnits
                        ? "text-primary-yellow border-primary-yellow/30"
                        : "text-gray-300 border-gray-500/30",
                      "text-xs"
                    )}
                  >
                    {calculation.after.totalUnits} un
                    {calculation.after.totalUnits !== calculation.current.totalUnits && (
                      <span className="ml-1">
                        {calculation.after.totalUnits > calculation.current.totalUnits ? (
                          <TrendingUp className="h-3 w-3 inline" />
                        ) : (
                          <TrendingDown className="h-3 w-3 inline" />
                        )}
                      </span>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Alerta de conversão */}
          {needsConversion && calculation.conversion && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <p className="text-sm font-medium text-orange-400">Conversão Automática Necessária</p>
              </div>
              <p className="text-xs text-gray-400">
                {calculation.conversion.packagesConverted} fardo(s) serão automaticamente convertidos em{' '}
                {calculation.conversion.unitsFromConversion} unidades para atender a esta operação.
              </p>
            </div>
          )}

          {/* Impacto financeiro */}
          {showFinancialImpact && calculation.financialImpact && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/20 border border-white/10 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Variação de Custo</p>
                <p className={cn(
                  "text-sm font-semibold",
                  calculation.financialImpact.costChange > 0 ? "text-red-400" :
                  calculation.financialImpact.costChange < 0 ? "text-green-400" :
                  "text-gray-300"
                )}>
                  {calculation.financialImpact.costChange > 0 ? '+' : ''}
                  {formatCurrency(calculation.financialImpact.costChange)}
                </p>
              </div>
              <div className="p-3 bg-black/20 border border-white/10 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Variação de Valor</p>
                <p className={cn(
                  "text-sm font-semibold",
                  calculation.financialImpact.valueChange > 0 ? "text-green-400" :
                  calculation.financialImpact.valueChange < 0 ? "text-red-400" :
                  "text-gray-300"
                )}>
                  {calculation.financialImpact.valueChange > 0 ? '+' : ''}
                  {formatCurrency(calculation.financialImpact.valueChange)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};