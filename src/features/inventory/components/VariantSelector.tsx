/**
 * VariantSelector.tsx - Componente para seleção de variante em operações de estoque
 * Permite escolher entre unidade e pacote com informações contextuais
 */

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/primitives/radio-group';
import { Label } from '@/shared/ui/primitives/label';
import { Badge } from '@/shared/ui/primitives/badge';
import { Package, Wine, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import type { ProductWithVariants, VariantType, VariantSelectorContext } from '@/core/types/variants.types';

interface VariantSelectorProps {
  product: ProductWithVariants;
  selectedVariant: VariantType;
  onVariantChange: (variant: VariantType) => void;
  context?: VariantSelectorContext;
  showPrices?: boolean;
  showStockInfo?: boolean;
  disabled?: boolean;
  className?: string;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  selectedVariant,
  onVariantChange,
  context = 'sales',
  showPrices = true,
  showStockInfo = true,
  disabled = false,
  className
}) => {
  const { 
    unit_variant, 
    package_variant, 
    can_sell_units, 
    can_sell_packages,
    can_adjust_units,
    can_adjust_packages
  } = product;
  
  // Determinar se as variantes estão disponíveis baseado no contexto
  const unitAvailable = context === 'sales' ? can_sell_units : can_adjust_units;
  const packageAvailable = context === 'sales' ? can_sell_packages : can_adjust_packages;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-400" />
        <p className="text-sm text-gray-400">
          {context === 'sales' 
            ? 'Selecione a variante que deseja adicionar ao carrinho'
            : 'Selecione a variante que deseja ajustar no estoque'
          }
        </p>
      </div>

      <RadioGroup
        value={selectedVariant}
        onValueChange={(value) => onVariantChange(value as VariantType)}
        disabled={disabled}
        className="space-y-3"
      >
        {/* Opção de Unidade */}
        {unit_variant ? (
          <div className={cn(
            "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
            selectedVariant === 'unit' 
              ? "border-primary-yellow bg-primary-yellow/10" 
              : "border-white/20 bg-black/20 hover:bg-white/5",
            !unitAvailable && "opacity-50"
          )}>
            <RadioGroupItem 
              value="unit" 
              id="variant-unit" 
              disabled={disabled || !unitAvailable}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="variant-unit" className={cn(
                "cursor-pointer flex items-center gap-2",
                (disabled || !unitAvailable) && "cursor-not-allowed"
              )}>
                <Wine className="h-4 w-4 text-green-400" />
                <span className="font-semibold text-white">Unidades Individuais</span>
                {selectedVariant === 'unit' && (
                  <CheckCircle className="h-4 w-4 text-primary-yellow" />
                )}
              </Label>
              
              <div className="mt-2 space-y-1">
                {showStockInfo && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        unit_variant.stock_quantity > 0
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-red-500/20 text-red-300 border-red-500/30"
                      )}
                    >
                      {unit_variant.stock_quantity} em estoque
                    </Badge>
                    {showPrices && (
                      <span className="text-sm text-gray-400">
                        {formatCurrency(unit_variant.price)} por unidade
                      </span>
                    )}
                  </div>
                )}
                
                {!unitAvailable && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      {context === 'sales' 
                        ? 'Sem estoque disponível para venda'
                        : 'Variante não configurada para ajuste'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 rounded-lg border p-4 opacity-50 border-gray-500/20 bg-gray-500/5">
            <RadioGroupItem value="unit" id="variant-unit" disabled className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="variant-unit" className="cursor-not-allowed flex items-center gap-2">
                <Wine className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-400">Unidades Individuais</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">Variante não configurada</p>
            </div>
          </div>
        )}

        {/* Opção de Pacote */}
        {package_variant ? (
          <div className={cn(
            "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
            selectedVariant === 'package' 
              ? "border-primary-yellow bg-primary-yellow/10" 
              : "border-white/20 bg-black/20 hover:bg-white/5",
            !packageAvailable && "opacity-50"
          )}>
            <RadioGroupItem 
              value="package" 
              id="variant-package" 
              disabled={disabled || !packageAvailable}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="variant-package" className={cn(
                "cursor-pointer flex items-center gap-2",
                (disabled || !packageAvailable) && "cursor-not-allowed"
              )}>
                <Package className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-white">Fardos/Pacotes</span>
                {selectedVariant === 'package' && (
                  <CheckCircle className="h-4 w-4 text-primary-yellow" />
                )}
              </Label>
              
              <div className="mt-2 space-y-1">
                {showStockInfo && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        package_variant.stock_quantity > 0
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-red-500/20 text-red-300 border-red-500/30"
                      )}
                    >
                      {package_variant.stock_quantity} fardos em estoque
                    </Badge>
                    {showPrices && (
                      <span className="text-sm text-gray-400">
                        {formatCurrency(package_variant.price)} por fardo
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-400">
                  Cada fardo contém {package_variant.units_in_package || 1} unidades
                </p>
                
                {!packageAvailable && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      {context === 'sales' 
                        ? 'Sem fardos disponíveis para venda'
                        : 'Variante de pacotes não configurada'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 rounded-lg border p-4 opacity-50 border-gray-500/20 bg-gray-500/5">
            <RadioGroupItem value="package" id="variant-package" disabled className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="variant-package" className="cursor-not-allowed flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-400">Fardos/Pacotes</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">Variante não configurada</p>
            </div>
          </div>
        )}
      </RadioGroup>

      {/* Resumo da seleção */}
      {selectedVariant && (
        <div className="p-3 bg-primary-yellow/10 border border-primary-yellow/20 rounded-lg">
          <p className="text-sm font-medium text-primary-yellow mb-1">
            Variante selecionada: {selectedVariant === 'unit' ? 'Unidades Individuais' : 'Fardos/Pacotes'}
          </p>
          {selectedVariant === 'unit' && unit_variant && (
            <p className="text-xs text-gray-400">
              Estoque atual: {unit_variant.stock_quantity} unidades
              {showPrices && ` • ${formatCurrency(unit_variant.price)} cada`}
            </p>
          )}
          {selectedVariant === 'package' && package_variant && (
            <p className="text-xs text-gray-400">
              Estoque atual: {package_variant.stock_quantity} fardos ({package_variant.units_in_package || 1} un cada)
              {showPrices && ` • ${formatCurrency(package_variant.price)} por fardo`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};